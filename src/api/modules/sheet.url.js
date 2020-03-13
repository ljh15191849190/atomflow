import { URL } from '../url.config'

export default {
    getFolderTreeNodes: `${URL}v1/script/node`, // 
    saveFolderNode: `${URL}v1/script/node`, // 
    checkExistFolderName: `${URL}v1/script/node/check/name`, // 指定的用户名是否存在，校验脚本名称是否重复使用
    checkExistFileName: `${URL}v1/script/file/name/count`,
    editFolderNode: `${URL}v1/script/node/:nodeId`,
    deleteFolderNode: `${URL}v1/script/node/:nodeId`,
    getSheetListByFolderId: `${URL}v1/script/file/list`,
    saveSheet: `${URL}v1/script/file`,
    deleteSheet: `${URL}v1/script/file/:fileId`,
    shareSheet: `${URL}v1/script/file/share`,
    getSheetById: `${URL}v1/script/file`,
    updateSheet: `${URL}v1/script/file`,
    getAllLabels: `${URL}v1/script/tag`,
    saveLabel: `${URL}v1/script/tag`,
    getShellContent: `${URL}v1/script/file`,
    uploadSheet: `${URL}v1/script/file/upload`,
    downLoadSheetFile: `${URL}v1/script/file/download`,
    getReturnCodeList: `${URL}v1/script/file/name/count`,
    dispatchSheet: `${URL}v1/task/dispatch`,
    gitExcuteTaskList: `${URL}v1/task/list`,
    getTaskDetail: `${URL}v1/task/detail/:taskId`,
    getTaskLog: `${URL}v1/task/log/:taskId`,
    runExecute: `${URL}v1/sql/query`,
    getSheetToolsList: `${URL}v1/script/file/initTool/list`,
    runSheelTest: `${URL}v1/task/dispatch`,
    sheetCommandCheck: `${URL}v1/command/check_content`,
    sheetUploadCheck: `${URL}v1/command/check_content_upload`
}
