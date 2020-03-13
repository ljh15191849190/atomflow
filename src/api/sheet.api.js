import axios from 'axios'
import {URL} from './url.config'
class SheetApi {
    uploadSheet (data, onProgress) {
        let config = {
            url: URL + 'v1/script/file/upload',
            method: 'post',
            data,
            headers: {
                'Content-Type': 'multipart/form-data'
            } 
        }
        if (onProgress) {
            config.onUploadProgress = onProgress
        }
        return axios(config)
    }

}

export default new SheetApi()
