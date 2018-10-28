exports.handler = async function (context, event, callback) {
  // initialize Twilio client
  const client = context.getTwilioClient()

  function parseNumber (message) {
    // Check to make sure there are at least two numbers
    if (message.match(/\d{2,}/g)) {
      const cleanedUpNumber = message.replace(/[-() ]/g, '')
      // Check if it's less than 10 digits
      if (cleanedUpNumber.length < 10) {
        return false
        // Check if equal to 10
      } else if (cleanedUpNumber.length === 10) {
        return `+1${cleanedUpNumber}`
        // Check if it has country code
      } else if (cleanedUpNumber.length > 10) {
        const countryCode = '+1'
        if (cleanedUpNumber.slice(0, 2) === countryCode) {
          return cleanedUpNumber
        }
      }
      return false
    } else {
      return false
    }
  }

  function sendMessage (message) {
    let twiml = new Twilio.twiml.MessagingResponse()
    twiml.message(message)
    callback(null, twiml)
  }

  function getCallerName (number) {
    return new Promise((resolve, reject) => {
      client.lookups.phoneNumbers(number)
        .fetch({type: 'caller-name'})
        .then(phone_number => {
          resolve(phone_number.callerName.caller_name)
        })
        .done()
    })
  }

  // Validate number
  const number = parseNumber(event.Body)
  let message = ''
  if (number) {
    // Find out who the number belongs to
    const callerName = await getCallerName(number)
    if (callerName !== null) {
      message = `This number appears to be registered to: ${callerName}`
    } else {
      message = `Aw. Sorry to let you down but we can't associate a name with that number.`
    }
  } else {
	    message = 'Oops! The number you sent doesn\'t appear to be correct. Please make sure it has ten digits. Can you try sending the number again?'
  }
  sendMessage(message)
}
