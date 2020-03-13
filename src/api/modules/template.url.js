import { URL } from '../url.config'

export default {
    saveTemplate: `${URL}v1/flow/create`,
    getTemplateList: `${URL}v1/flow/list`,
    getTemplateById: `${URL}v1/flow/detail`,
    getTemplateRelation: `${URL}v1/flow/relation`,
    updateTemplate: `${URL}v1/flow/edit`,
    deleteTemplate: `${URL}v1/flow/del`,
    queryTemplateByName: `${URL}v1/flow/check/name`,
    sharedTemplate: `${URL}v1/flow/shared`
}
