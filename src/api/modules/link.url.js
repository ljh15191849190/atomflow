import { URL } from '../url.config'

export default {
    getLinkList: `${URL}v1/conn/list`,
    createLink: `${URL}v1/conn/create`,
    getLinkDetail: `${URL}v1/conn/detail`,
    deleteLink: `${URL}v1/conn/del`,
    checkLinkName: `${URL}v1/conn/check/connId`,
    editLink: `${URL}v1/conn/edit`,
    sqlJdbcConf: `${URL}v1/sql/jdbc/conf`
}
