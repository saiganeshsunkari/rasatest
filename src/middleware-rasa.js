const request = require('request-promise')
//const debug = require('debug')('botkit:rasa')

module.exports = config => {
  if (!config) {
    config = {}
  }

  if (!config.rasa_uri) {
    config.rasa_uri = 'http://34.227.175.80:5000'
  }

  var middleware = {
    receive: (bot, message, next) => {
      if (!message.text || message.is_echo) {
		 
        next()
        return
      }
//http://34.227.175.80:5000/parse?q=hi&model=carla_model
      const options = {
        method: 'GET',
        uri: 'http://34.227.175.80:5000/parse?q='+message.text+'&model=carla_model',
        json: true
      }

      request(options)
        .then(response => {
          message.intent = response.intent
          message.entities = response.entities
          next()
        })
    },

    hears: (patterns, message) => {
      return patterns.some(pattern => {
        if (message.intent.name === pattern) {
          return true
        }
      })
    }

  }
  return middleware
}
