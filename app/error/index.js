const userErrorMessage = require('./userErrorMessages')
const workErrorMessage = require('./workErrorMessages')

module.exports = {
  ...userErrorMessage,
  ...workErrorMessage
}
