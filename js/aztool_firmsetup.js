// 設定ファイルを選択して初期化する

if (!window.aztool) aztool = {};

aztool.firm_setup_enable = false;


// キーボードリスト(デフォルト) GASからリスト取得失敗した場合表示される
aztool.setup_keyboard_list = [
    {"name": "AZPOCKET", "github": "https://github.com/palette-system/az-core/tree/main/azpocket"}
];

// ファームセットアップ初期処理
aztool.firm_setup_init = function() {
    // GAS からキーボードリスト取得
    aztool.get_keyboard_list();
};

// Github URL から画像とインポート用の URL を作成する
aztool.create_github_url = function(main_url) {
    var i;
    var url_data = main_url.split("/");
    var github_user = url_data[3]; // github ユーザー名
    var github_repo = url_data[4]; // リポジトリ名
    var github_branch = url_data[6]; // ブランチ名
    var github_path = "";
    for (i in url_data) {
        if (i < 7) continue;
        github_path += "/" + url_data[i];
    }
    var base_url = "https://github.com/" + github_user + "/" + github_repo + "/raw/refs/heads/" + github_branch + github_path;
    var res = {
        "github_user": github_user,
        "github_repo": github_repo,
        "github_branch": github_branch,
        "base": base_url,
        "image": base_url + "/main.jpg",
        "zip": base_url + "/import.zip"
    };
    return res;
};


aztool.firm_setup = function() {
    aztool.firm_setup_enable = true;
    let i, k;
    let h = "";
    h += "<div style='text-align: center; margin: 0; width: 100%;'>";
    h += "<h2 style='font-size: 40px; margin: 20px 0 20px 0;'>⌨ AZTOOL</h2>";
    h += "<br>";
    h += "<font style='font-size: 20px; font-weight: bold;'>初期セットアップ</font><br>接続しているキーボードを選択して下さい。<br>";
    h += "<br>";

    h += "<div id='keyboard_list_box'>";

    h += "<div class='setup_menu_btn' onClick='javascript:aztool.setup_default();'>";
    h += "<img class='setup_menu_img' style='height: 120px;' src='./img/default_icon.jpg'><br>";
    h += "<div class='setup_menu_title'>このまま使う</div>";
    h += "<div style='margin: 0 10px;'>初期設定のままキーボードを使用します。</div>";
    h += "</div>";

    h += "<div class='setup_menu_btn' onClick='javascript:aztool.addopt_start(\"main_box\", 100);'>";
    h += "<img class='setup_menu_img' style='height: 120px;' src='./img/custam_icon.jpg'><br>";
    h += "<div class='setup_menu_title'>カスタム設定</div>";
    h += "<div style='margin: 0 10px;'>配列とピンを指定で新しいキーボード設定を行います。</div>";
    h += "</div>";

    h += "<div class='setup_menu_btn' onClick='javascript:aztool.file_import_modal_open();'>";
    h += "<img class='setup_menu_img' style='height: 120px;' src='./img/zipimport_icon.jpg'><br>";
    h += "<div class='setup_menu_title'>ZIP インポート</div>";
    h += "<div style='margin: 0 10px;'>配布されている ZIP ファイルからキーボード設定を行います。</div>";
    h += "</div>";

    h += "<br>";

    for (i in aztool.setup_keyboard_list) {
        k = aztool.setup_keyboard_list[i];
        h += "<div class='setup_menu_btn' onClick='javascript:aztool.github_import_file(\"" + k.github + "\",\"/import.zip\");'>";
        h += "<img class='setup_menu_img' src='" + k.url.image + "'><br>";
        h += "<div class='setup_menu_title'>" + k.name + "</div>";
        h += "</div>";    
    }

    h += "</div>";
    h += "<div style='margin: 100px 0 0 0;'>";
    h += "<img style='width: 147px; height: 147px;' src='./img/logo2.jpg' alt='パレットシステム'>"
    h += "</div>";
    h += "</div>";
    $("#main_box").html(h);

};

// デフォルト設定のままキーボードを使用する
aztool.setup_default = function() {
    // デフォルトフラグを下げる
    delete aztool.setting_json_data.default;
    // ロード処理の続きに戻る (I2C ロード処理)
    aztool.load_i2c_data();
};
