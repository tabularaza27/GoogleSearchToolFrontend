<template>
    <v-layout row wrap>
        <v-flex xs4 offset-xs4>
            <!-- Query-->
            <v-text-field
              name="input-1"
              label="Search Query"
              v-model="query"
            ></v-text-field>
            <!-- Country -->
            <v-text-field
              name="input-1"
              label="Country"
              v-model="country"
              @input="triggerQuery('country')"
            ></v-text-field>
            <suggestion-dropdown type="country" :suggestionArray="countrySuggestions" v-if="Object.keys(countrySuggestions).length !== 0" @selected="selectItem"></suggestion-dropdown>
            <!-- City -->
            <v-text-field
              name="input-1"
              label="City"
              v-model="city"
              @input="triggerQuery('city')"
            ></v-text-field>
            <suggestion-dropdown type="city" :suggestionArray="citySuggestions" v-if="Object.keys(citySuggestions).length !== 0" @selected="selectItem"></suggestion-dropdown>
            <!-- Go -->
            <v-btn block class="success" @click="search()">Start Search</v-btn>
        </v-flex>
    </v-layout>
</template>

<script>
  import { database } from '../aws.config'
  import suggestionDropdown from './helperComponents/suggestionDropdown'
  import axios from 'axios'

  export default {
    data () {
      return {
        test: '',
        query: 'restaurant',
        // strings for v-model input
        city: '',
        country: '',
        // selected Items
        selectedCountry: '',
        selectedCity: '',
        // arrays with suggestions from database
        countrySuggestions: [],
        citySuggestions: [],
        // if query status true: no new queries can be fired
        queryStatus: false,
        // detect if input is reduced. if true, no new query will be fired
        reducing: false,
        // window Object Reference
        windowObjectReference: ''

      }
    },
    methods: {
//      test() {
//        console.log('hiii')
//      },
      triggerQuery (type) {
        if(!this.queryStatus && !this.reducing) {
          if (type === 'city') {
            if (this.city.length > 2 && this.selectedCountry) {
              this.queryStatus = true
              setTimeout(this.queryCity, 1000)
            } else {
              console.log('Bitte Land auswählen oder mehr eingeben')
            }
          } else if (type === 'country') {
            if (this.country.length > 2) {
              this.queryStatus = true
              setTimeout(this.queryCountry, 1000)
            } else {
              console.log('mehr eingeben')
            }
          }
        } else {
          console.log('Query wird bereits ausgefuehrt oder input wird reduced')
        }
      },
      scanExecute(params, type) {
        console.log(type, this.citySuggestions)
        database.scan(params, (err,result) => {
          if(err) {
            console.log('Error',err);
          } else {
            if (type === 'city') {
              this.citySuggestions = this.citySuggestions.concat(result.Items);
            } else if (type === 'country') {
              this.countrySuggestions = this.countrySuggestions.concat(result.Items)
            }
            if(result.LastEvaluatedKey) {
              params.ExclusiveStartKey = result.LastEvaluatedKey;
              this.scanExecute(params, type);
            }
          }
        });
      },
      queryCountry () {
        console.log(this.upperCase(this.country))
        this.countrySuggestions = []
        let params = {
          ExpressionAttributeValues: {
            ':c': {S: this.upperCase(this.country)}
          },
          FilterExpression: 'contains(canonicalCountry, :c)',
          ProjectionExpression: 'canonicalCountry, country, countryCode, languageCode, googleTLD, uule',
          TableName: 'countries'
        }
        console.log('scan', this.country)
        this.scanExecute(params, 'country')
        this.queryStatus = false
      },
      queryCity () {
        this.citySuggestions = []
        let params = {
            ExpressionAttributeValues: {
              ':c': {S: this.upperCase(this.city)},
              ':country': {S: this.selectedCountry.countryCode.S}
            },
            FilterExpression: 'contains(city,:c) and countryCode = :country',
            ProjectionExpression: 'canonicalName, city, countryCode, uule',
            TableName: 'cities'
        }
        console.log('scan',this.city)
        this.scanExecute(params,'city')

        this.queryStatus = false
      },
      /**
       * sets city/country value to selected item
       * @param value {type, item}
       */
      selectItem (value) {
        console.log('selectItem', value)
        if (value.type === 'city') {
          this.city = value.item.city.S
          this.selectedCity = value.item
        } else if (value.type === 'country') {
          this.country = value.item.country.S
          this.selectedCountry = value.item
        }
      },
      /**
       * Set reducing variable to true if user is reducing input
       * @param newVal newVal of input field
       * @param oldVal oldVal of input field
       */
      setReducing(newVal,oldVal) {
        if (oldVal.length > newVal.length) {
          this.reducing = true
        } else {
          this.reducing = false
        }
      },
      search() {
        this.windowObjectReference = window.open('https://www.google.com')
        // if uule doesnt exist yet, query rest api
        console.log('Start Search')
        if (this.selectedCity && !this.selectedCity.uule) {
          console.log('Request Api')
          axios.request({
            url: 'https://ti1ae0euz8.execute-api.us-east-1.amazonaws.com/dev/createUule',
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              canonicalName: this.selectedCity.canonicalName.S
            }
          }).then((response) => {
              console.log('Set uule parameter:', response.data )
              this.selectedCity = Object.assign({}, this.selectedCity, {uule : {S: response.data.uule}})
              console.log('Create Search String')
              this.createGoogleSearchQuery(this.query, this.selectedCountry, this.selectedCity)
            })
            .catch(function (error) {
              console.log(error);
            });
        } else {
          console.log('UULE already exists, Create Search String')
          this.createGoogleSearchQuery(this.query, this.selectedCountry, this.selectedCity)
        }
      },
      createGoogleSearchQuery(query, country, city=false) {
        console.log(query, country, city)
        if (city) {
          console.log('city exists')
        } else {
          console.log('no city')
        }
        let tld = country.googleTLD ? country.googleTLD.S : 'com'
        let languageCode = country.languageCode.S
        let uule = city ? city.uule.S : country.uule.S
        let countryCode = country.countryCode.S
        let url = `https://www.google.${tld}/search?hl=${languageCode}&q=${query}&uule=${uule}&gl=${countryCode}`
//      If Country is United Stated force google.com with parameters below
        if (countryCode == 'US'){
          url += '&gfe_rd=cr&gws_rd=cr'
        }
        console.log('Query:', url)
        //      Open new Tab
        console.log('Set URL of opened Tab to url')
        this.windowObjectReference.location.href = url
      },
    },
    watch: {
      city(newVal,oldVal) {
        this.setReducing(newVal,oldVal)
      },
      country(newVal, oldVal) {
        this.setReducing(newVal,oldVal)
      }
    },
    components: {
      suggestionDropdown
    }
  }
</script>