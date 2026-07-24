'use strict';

module.exports = {

    /*
    |--------------------------------------------------------------------------
    | Folder yang WAJIB dibackup
    |--------------------------------------------------------------------------
    */

    include: [

        'Default'

    ],

    /*
    |--------------------------------------------------------------------------
    | Folder di dalam Default yang WAJIB dibackup
    |--------------------------------------------------------------------------
    */

    defaultInclude: [

        'IndexedDB',

        'Local Storage',

        'Session Storage',

        'Network',

        'Cookies',

        'Preferences',

        'WebStorage'

    ],

    /*
    |--------------------------------------------------------------------------
    | Folder yang DIABAIKAN
    |--------------------------------------------------------------------------
    */

    defaultExclude: [

        'Cache',

        'Code Cache',

        'GPUCache',

        'Service Worker/CacheStorage',

        'Crashpad',

        'GrShaderCache',

        'ShaderCache',

        'DawnCache',

        'Media Cache'

    ]

};