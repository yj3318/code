// 全局配置文件
const CONFIG = {
    API_URL: {
        MINA_API: 'https://st-api.dangdang.com/',
    },
    H5_URL: {
        E_URL: 'https://e.dangdang.com/', //数字线上环境
    },
    MAPI_ENCODE_STR: 'pond757heag7qg39ew8fvq38g8943yt=',
    MAPI_USER_CLIENT: 'mina',
    MAPI_CLIENT_VERSION: '1.0',
    ERROR_PAGE: {
        //错误页图片路径
        ERROR_PIC_URL: {
            empty: 'https://img61.ddimg.cn/upload_img/00766/ddreading/blank-search-1552016624.png',
            nowireless: '../../images/404.png',
        },
        //错误页默认文字路径
        ERROR_TEXT: {
            empty: '书海捞针，没找到对应书籍呢…',
            error: '很抱歉，获取数据失败！',
            nowireless: '信号丢到外太空，\n检查一下网络连接吧~',
        },
    },
    MYUNIONID_STORAGE_NAME: 'my_unionid',
    MYUDID_STORAGE_NAME: 'udid',
    MYPERMANENTID_STORAGE_NAME: 'permanent_id',
    SEARCH_HISTORY: {
        NAME: 'search_history',
        SPLIT: '```',
    },
    // 分享相关配置
    SHARE: {
        IMAGE_URL: 'https://img62.ddimg.cn/upload_img/00610/ddreader/ddreader_share_pic-1536892799.png', // 分享图片
    },
}
export default CONFIG
