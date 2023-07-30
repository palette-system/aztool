// webhid -> i2c 越しに OLED を制御するライブラリ


if (!window.webhid) webhid = {};

// OLED 初期化用コマンド
// 参考
// https://github.com/adafruit/Adafruit_SSD1306/blob/2.5.8/Adafruit_SSD1306.cpp#L562-L618
webhid.oled_init_cmd = [
    [0x00, 0xAE, 0xD5, 0x80, 0xA8],
    [0x00, 0x1F],
    [0x00, 0xD3, 0x00, 0x40, 0x8D],
    [0x00, 0x14],
    [0x00, 0x20, 0x00, 0xA1, 0xC8],
    [0x00, 0xDA],
    [0x00, 0x02],
    [0x00, 0x81],
    [0x00, 0x8F],
    [0x00, 0xD9],
    [0x00, 0xF1],
    [0x00, 0xDB, 0x40, 0xA4, 0xA6, 0x2E, 0xAF]
];

// 画像送信時のコマンド
webhid.oled_img_cmd = [
    [0x00, 0x22, 0x00, 0xff, 0x21, 0x00],
    [0x00, 0x07]
];

// 画面初期化のコマンド送信
webhid.oled_send_init = function(oled_addr, oled_width, oled_height, cb_func) {
    if (!cb_func) cb_func = function(stat, raw_data) {};
    // 初期化用のコマンド生成
    let cmd_list = JSON.parse(JSON.stringify(webhid.oled_init_cmd)); // デフォルトの初期化コマンドのコピーを作成
    // 画面サイズによってコマンドの一部を変更
    if (oled_width == 128 && oled_height == 32) {
        cmd_list[6][1] = 0x02;
        cmd_list[8][1] = 0x8F;
    } else if (oled_width == 128 && oled_height == 32) {
        cmd_list[6][1] = 0x12;
        cmd_list[8][1] = 0xCF;
    } else if (oled_width == 96 && oled_height == 16) {
        cmd_list[6][1] = 0x02;
        cmd_list[8][1] = 0xAF;
    }
    // 画面の高さ
    cmd_list[1][1] = oled_height - 1;
    // 初期化コマンド送信
    webhid.i2c_write_list(oled_addr, cmd_list, cb_func);
};

// 画像データ送信
webhid.oled_send_img = function(oled_addr, oled_width, oled_height, img_data, cb_func) {
    if (!cb_func) cb_func = function(stat, raw_data) {};
    // 画像送信用のコマンド生成
    let cmd_list = JSON.parse(JSON.stringify(webhid.oled_img_cmd)); // デフォルトの初期化コマンドのコピーを作成
    // 画像の幅を設定
    cmd_list[1][1] = oled_width - 1;
    // コマンドリストに画像データを追加
    let send_data = [0x40];
    let data_cp = JSON.parse(JSON.stringify(img_data));
    while (data_cp.length) {
        send_data.push(data_cp.shift());
        if (send_data.length >= 24) {
            cmd_list.push(send_data);
            send_data = [0x40];
        }
    }
    if (send_data.length > 1) cmd_list.push(send_data);
    // 画像送信コマンド送信
    webhid.i2c_write_list(oled_addr, cmd_list, cb_func);
};


