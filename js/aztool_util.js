// 共通関数

if (!window.aztool) aztool = {};

// 2つのbyteをshortとして数値にする
aztool.short = function(hb, lb) {
    let i = 0;
    if (hb & 0x80) {
        // マイナス
        return (((hb & 0x7F) << 8) + lb) - 0x8000;
    } else {
        return (hb << 8) + lb;
    }
}

// 0詰め
aztool.zero = function(n, len){
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
aztool.to_hex = function(n, len=2, px="0x") {
    return px + n.toString(16).padStart(len, "0");
};

// 16進数の文字を数字にする
aztool.hex_to_int = function(hex_str) {
    return parseInt(hex_str, 16);
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
aztool.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

// 配列の中から重複分を削除
aztool.array_uniq = function(a) {
    let x = new Set(a); // Setに変換して重複分を削除
    return Array.from(x);
};

// 渡された文字列が数字のみかどうか
aztool.is_num = function(str) {
    return (str.match(/[^0-9]+/))? false: true;
};

// 渡された文字列が数字とカンマのみか(ピン入力の内容チェック用)
aztool.is_pin_num = function(str) {
    return (str.match(/[^0-9, -]+/))? false: true;
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

// ios かどうか
aztool.is_ios = function() {
    return Boolean(navigator.userAgent.match(/iPad|iPhone/));
};

// スマートフォンかどうか
aztool.is_mobile = function() {
    return Boolean(navigator.userAgent.match(/iPad|iPhone|Android.+Mobile/));
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

// モーダルオープン
aztool.remodal_open = function(html, opt) {
    let i;
    let optset = {"max-width": "1200px", "width": "1200px", "min-height": "600px", "height": ""};
    if (!opt) opt = {};
    for (i in opt) optset[i] = opt[i];
    $("#util_remodal").css(optset);
    $("#util_remodal").html(html);
    aztool.util_remodal.open();
};

// モーダル閉じる
aztool.remodal_close = function() {
    aztool.util_remodal.close();
    $("#util_remodal").html("");
};

// メッセージウィンドウを表示
aztool.alert = function(msg, btn, cb_func) {
    if (!cb_func) cb_func = function() {};
    if (!btn) btn = "閉じる";
    let h = "";
    h += "<center style='margin: 50px; 100px'>";
    h += "<div style='margin: 50px;'>"+msg+"</div>";
    h += "<a id='alert_close_btn' class='exec-button'>"+btn+"</a>";
    h += "</center>";
    aztool.remodal_open(h, {"max-width": "", "width": "", "min-height": ""});
    // クリックイベント
    $("#alert_close_btn").click(function() {
        aztool.remodal_close();
        cb_func();
    });
};

// はい、いいえのダイアログ
aztool.confirm = function(msg, cb_func, btn) {
    if (!cb_func) cb_func = function(s) { console.log(s); };
    if (!btn) btn = {"yes": "はい", "no": "いいえ"};
    let h = "";
    h += "<center style='margin: 50px; 100px'>";
    h += "<div style='margin: 50px;'>"+msg+"</div>";
    h += "<a id='confirm_btn_n' class='cancel-button'>"+btn.no+"</a>";
    h += "　　　　<a id='confirm_btn_y' class='exec-button'>"+btn.yes+"</a>";
    h += "</center>";
    aztool.remodal_open(h, {"max-width": "", "width": "", "min-height": ""});
    // クリックイベント
    $("#confirm_btn_n").click(function() {
        aztool.remodal_close();
        cb_func(0);
    });
    $("#confirm_btn_y").click(function() {
        aztool.remodal_close();
        cb_func(1);
    });

};

// データをダウンロードする
aztool.data_download = function(fileName, data_arr, data_type) {
    if (!data_type) data_type = "text/plain";
    let blob_data = new Blob([data_arr], { "type": data_type });
    let aobj = document.createElement("a");
    aobj.href = URL.createObjectURL(blob_data);
    aobj.target = "_blank";
    aobj.download = fileName;
    aobj.click();
    URL.revokeObjectURL(aobj.href);
};

// 接続しているキーボードがAZ-COREかどうか
aztool.is_azcore = function() {
    if (!aztool.setting_json_data || !aztool.setting_json_data.keyboard_type) return false;
    let t = aztool.setting_json_data.keyboard_type;
    if (t == "az_core" || t == "az_core_b") return true;
    return false;
};

// 接続しているキーボードのモニターが縦向きか横向きか
// -1 = モニターがない
// 0 = たて長
// 1 = よこ長
aztool.get_disp_rotation = function() {
    if (!aztool.setting_json_data || 
        aztool.setting_json_data.disp_rotation === undefined || 
        aztool.setting_json_data.disp_rotation === null) return -1;
    let r = aztool.setting_json_data.disp_rotation;
    if (r == 1 || r == 3) return 1;
    if (r == 0 || r == 2) return 0;
    return -1;
};

// 本体のKLEを取得
aztool.get_main_kle = function() {
    // ロードしたkle.json データがあればそれを返す
    if (aztool.main_kle_data) return aztool.main_kle_data;
    // キーボードのタイプが取得できてなければ空文字を返す
    if (!aztool.setting_json_data ||
        !aztool.setting_json_data.keyboard_type ||
        !aztool.main_kle[aztool.setting_json_data.keyboard_type]) return "";
    // キーボードのタイプに合うKLE文字を取得
    return aztool.main_kle[aztool.setting_json_data.keyboard_type];
};

// アクチュエーション設定があるキーボードかどうか
aztool.is_actuation_kb = function() {
    return (aztool.actuation_kb_list.indexOf(aztool.setting_json_data.keyboard_type) >= 0);
};

// nRF52840 系かどうか
aztool.is_nrf52 = function() {
    return (aztool.firm_info.eep_data.substring(0,3) == 'AZN');
};

// デフォルトの設定かどうか
aztool.is_default_setting = function() {
    return ("default" in aztool.setting_json_data);
};