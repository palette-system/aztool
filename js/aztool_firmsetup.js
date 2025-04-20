// 設定ファイルを選択して初期化する

if (!window.aztool) aztool = {};

aztool.firm_setup_enable = false;

// キーボードリスト
aztool.setup_keyboard_list = [
    {"name": "AZPOCKET", "img": "./img/setup_azpocket.jpg", "zip": "./data/ZIP_BLE.zip"}
];


aztool.firm_setup = function() {
    aztool.firm_setup_enable = true;
    let i, k;
    let h = "";
    h += "<div style='text-align: center; margin: 0; width: 100%;'>";
    h += "<h2 style='font-size: 40px; margin: 20px 0 20px 0;'>⌨ AZTOOL</h2>";
    h += "<br>";
    h += "<font style='font-size: 20px; font-weight: bold;'>初期セットアップ</font><br>接続しているキーボードを選択して下さい。<br>";
    h += "<br>";

    h += "<div class='setup_menu_btn' onClick='javascript:aztool.addopt_start(\"main_box\", 100);'>";
    h += "<img class='setup_menu_img' style='height: 120px;' src='./img/custam_icon.jpg'><br>";
    h += "<div class='setup_menu_title'>新規作成</div>";
    h += "<div style='margin: 0 10px;'>配列とピンを指定で新しいキーボード設定を行います。</div>";
    h += "</div>";

    h += "<div class='setup_menu_btn' onClick='javascript:aztool.file_import_modal_open();'>";
    h += "<img class='setup_menu_img' style='height: 120px;' src='./img/zipimport_icon.jpg'><br>";
    h += "<div class='setup_menu_title'>ZIP インポート</div>";
    h += "<div style='margin: 0 10px;'>エクスポートした ZIP ファイルや、配布されている ZIP ファイルを指定してキーボード設定を行います。</div>";
    h += "</div>";

    for (i in aztool.setup_keyboard_list) {
        k = aztool.setup_keyboard_list[i];
        h += "<div class='setup_menu_btn' onClick='javascript:aztool.file_import_url(\"" + k.zip + "\");'>";
        h += "<img class='setup_menu_img' src='" + k.img + "'><br>";
        h += "<div class='setup_menu_title'>" + k.name + "</div>";
        h += "</div>";    
    }

    h += "<div style='margin: 100px 0 0 0;'>";
    h += "<img style='width: 147px; height: 147px;' src='./img/logo2.jpg' alt='パレットシステム'>"
    h += "</div>";
    h += "</div>";
    $("#main_box").html(h);

};
