import { Validator } from 'vee-validate'
import Api from '@api'
const ifExistVali = (value, args) => {
    return args[0](value)
}
const customArray = (value, args) => {
    if (!value.length) {
        return false
    }
        
    return true
}

const customIncludes = (value, [url]) => {
    let params = {}
    params.name = value
    return Api.get(url, params, {}).then(
        res => {
            if (res.data.exist) {
                return false
            } else {
                return {valid: true}
            }
        }
    )
}

// AT-615 类型为object的属性不能为空校验
const objectRequired = (value, args) => {
    if (typeof value === 'object') {
        return Object.keys(value).length > 1
    } else if (!value && value !== 0) {
        return false
    }
}

Validator.extend('taskExist', ifExistVali)
Validator.extend('array', customArray)
Validator.extend('customIncludes', customIncludes)
Validator.extend('objectRequired', objectRequired)

export default Validator
