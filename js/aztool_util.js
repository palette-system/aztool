// 共通関数

if (!window.aztool) aztool = {};


// 0詰め
pinstp.zero = function(n, len){
    return n.toString().padStart(len, "0");
};

// ランダムな数字を生成
aztool.random_num = function(n) {
    let r = [];
    while (n > r.length) {
        r.push(Math.floor( Math.random() * 10 ));
    }
    return r.join("");
};

// 16進数で表示
aztool.to_hex = function(n, len=2) {
    return "0x" + n.toString(16).padStart(len, "0");
};

// ミリ秒の時間を取得
aztool.millis = function() {
    let d = new Date();
    return d.getTime();
};

// KLEのJSON文字列をJS配列に変換
aztool.kle_json_parse = function(json_data) {
    var tx = json_data.replace(/({|,|\s)([\w|\d]{1,3}):/g, "$1\"$2\":")
    return JSON.parse("[" + tx + "]");
};

// キーコード(JS)からキーコードデータを取得
aztool.get_key_data = function(c, s) {
    let i, k, t;
    for (i in aztool.keycode) {
        k = aztool.keycode[i];
        if (k[c] == s) {
            // 
            if (aztool.setmap_language == 0) { // 日本語
                t = (k[1])? k[1]: k[0];
            } else { // 一旦それ以外は英語
                t = k[0];
            }
            return {
                "str": t,
                "hid": k[2],
                "ascii": k[3]
            };
        }
    }
    return {"str": "", "hid": 0, "ascii": 0};
};

// オブジェクトのクローンを作成(function などはクローンされないので注意)
aztool.crone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

// 渡された文字列が数字のみかどうか
aztool.is_num = function(str) {
    return (str.match(/[^0-9]+/))? false: true;
};

// 渡された半角文字のみかどうか
aztool.is_han = function(str) {
    return (str.match(/^[a-zA-Z0-9!-/:-@¥[-`{-~]*$/))? true: false;
};

// URLチェック
aztool.on_url = function(url) {
    // 入力が無い場合はOK
    if (!url.length) return true;
    // 頭7文字が http:// で始まらなければNG
    if (url.slice(0, 7) != "http://" && url.slice(0, 8) != "https://") {
        return false;
    }
    // それ以外はOK
    return true;
};

// ブラウザがChromeかどうか
aztool.is_chrome = function() {
    var ua = window.navigator.userAgent.toLowerCase();
    return Boolean(ua.indexOf("chrome") >= 0);
};

// スマートフォンかどうか
aztool.is_mobile = function isSmartPhone() {
    return Boolean(navigator.userAgent.match(/iPhone|Android.+Mobile/));
};

// util 用初期化
aztool.util_init = function() {
    // 共通のモーダル 初期化
    aztool.util_remodal_init();

};

// モーダル用HTML登録
aztool.util_remodal_init = function() {
    // モーダル用HTML登録
    let html = `
        <!-- レイヤー設定用モーダル -->
        <div id="util_remodal" class="remodal azmodal" data-remodal-id="util_remodal" 
                data-remodal-options="hashTracking: false, closeOnOutsideClick: false"
                style="max-width: 1200px; width: 1200px; min-height: 600px;">
        </div>`;
    $("body").append(html);
    // モーダル登録
    aztool.util_remodal = $('[data-remodal-id=util_remodal]').remodal();
    aztool.util_remodal.settings.closeOnOutsideClick = false;
    aztool.util_remodal.settings.hashTracking = false;
};
