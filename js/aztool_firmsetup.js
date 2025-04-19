// 設定ファイルを選択して初期化する

if (!window.aztool) aztool = {};

aztool.firm_setup_enable = false;

aztool.firm_setup = function() {
    aztool.firm_setup_enable = true;
    let i;
    let h = "", m = "", k = "";
    h += "<div style='text-align: center; margin: 0; width: 100%;'>";
    h += "<h2 style='font-size: 80px; margin: 20px 0 20px 0;'>⌨ AZTOOL</h2>";
    h += "<br>";
    h += "接続しているキーボードを選択して下さい。<br>";
    h += "<br>";

    m += "<div class='setup_menu_btn' onClick='javascript:aztool.addopt_start(\"main_box\", 100);'>";
    m += "<img class='setup_menu_img' style='height: 120px;' src='./img/custam_icon.jpg'><br>";
    m += "<div class='setup_menu_title'>新規作成</div>";
    m += "<div style='margin: 0 10px;'>配列とピンを指定で新しいキーボードを設定します。</div>";
    m += "</div>";

    m += "<div class='setup_menu_btn' onClick='javascript:aztool.file_import_modal_open();'>";
    m += "<img class='setup_menu_img' style='height: 120px;' src='./img/zipimport_icon.jpg'><br>";
    m += "<div class='setup_menu_title'>ZIP インポート</div>";
    m += "<div style='margin: 0 10px;'>ZIP ファイルを指定してキーボード設定を行います。</div>";
    m += "</div>";

    k += "<div class='setup_menu_btn' onClick='javascript:aztool.file_import_url(\"./data/ZIP_BLE.zip\");'>";
    k += "<img class='setup_menu_img' src='./img/custam_icon.jpg'><br>";
    k += "<div class='setup_menu_title'>ZIP_BLE</div>";
    k += "</div>";

    h += m + k + k + k + k + k + k;

    h += "<div style='margin: 140px 0 0 0; height: 80px; line-height: 80px;'>";
    h += "<img src='./img/palette_system_logo.png' alt='パレットシステム'>"
    h += "</div>";
    h += "</div>";
    $("#main_box").html(h);

};
