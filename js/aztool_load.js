// コネクション時などのロード処理

if (!window.aztool) aztool = {};

// 設定JSONの読み込み
aztool.load_setting_json = function() {
    aztool.view_load_page(); // ロード画面表示
    webhid.get_file(aztool.setting_json_path, function(stat, load_data) {
        // 読み込み失敗
        if (stat != 0) return;
        // 読み込み成功したらデータを受けとる
        let txt = webhid.arr2str(load_data);
        aztool.setting_json_data = JSON.parse(txt); // 設定データパース
        aztool.setting_json_txt = JSON.stringify(aztool.setting_json_data); // 設定データテキスト
        console.log(aztool.setting_json_txt);
        console.log(aztool.setting_json_data);
        // 別で読み込みが必要なi2cオプションのデータをロード
        aztool.i2c_option_data = {};
        aztool.i2c_load_index = 0;
        // 初期化がまだの場合はファームの初期化(設定ファイルの選択)を行う
        if (aztool.is_default_setting()) {
            // 初期化がまだの場合使用する設定ファイルを選択する
            aztool.firm_setup();
            // ファームウェアのバージョンやEEPROMの設定情報を取得（古いAZキーボードだとレスポンスが返ってこない場合がある）
            webhid.get_firmware_status(aztool.set_firmware_status);
        } else {
            // 設定済みの場合続けて i2c データのロード
            aztool.load_i2c_data();
        }
    });
};

// i2cデータのロード
aztool.load_i2c_data = function() {
    // i2cオプションのロード終わったらメニューを表示
    if (!aztool.setting_json_data.i2c_option || // i2cの設定が無い
        aztool.i2c_load_index >= aztool.setting_json_data.i2c_option.length) { // 全てロード完了
            // 本体に保存されているKLEのデータをロード
            aztool.load_kle_data();
            return;
    }
    // i2cのデータをロード
    let o = aztool.setting_json_data.i2c_option[ aztool.i2c_load_index ];
    let t;
    if (o.type == 1 || o.type == 2 || o.type == 5 || o.type == 7) {
        // IOエキスパンダ || I2Cロータリーエンコーダ || AZエキスパンダ
        // kleのJSONロード
        console.log("get_file: /o" + o.id);
        webhid.get_file("/o" + o.id, function(stat, load_data) {
            if (stat != 0) {
                // 読み込み失敗 空のデータを入れる
                aztool.i2c_option_data[ "o" + o.id ] = "";
            } else {
                // kleJSON取得
                aztool.i2c_option_data[ "o" + o.id ] = webhid.arr2str(load_data);
            }
            // 次のオプションを取得
            aztool.i2c_load_index++;
            aztool.load_i2c_data();
        });
        return;
    } else if (o.type == 3) {
        // PIM447 トラックボール
        aztool.i2c_option_data[ "o" + o.id ] = "[\"\"]";
    } else if (o.type == 4) {
        // PIM447 ロータリー
        aztool.i2c_option_data[ "o" + o.id ] = "[{x:1},\"\"],[\"\",\"\",\"\"],[{x:1},\"\"]";
    } else if (o.type == 6) { // KLEが無いオプションは空を入れておく
        // OLED メイン
        aztool.i2c_option_data[ "o" + o.id ] = "";
    }
    // 不明なオプションタイプ
    aztool.i2c_load_index++;
    aztool.load_i2c_data();
};

// 本体に保存されているKLEのデータをロード
aztool.load_kle_data = function() {
    console.log("load_kle_data: file " + aztool.kle_json_path);
    webhid.get_file(aztool.kle_json_path, function(stat, load_data) {
        console.log("load_kle_data: status " + stat);
        // 読み込めていればファイルの内容を保持
        aztool.main_kle_data = "";
        if (stat == 0) { // 0 読み込み成功 1 何かしらのエラー 2 ファイルが無い
            aztool.main_kle_data = webhid.arr2str(load_data);
        }
        // ディスク情報の取得へ
        aztool.load_disk_info();
    });
};

// ファームウェアステータスを取得する
aztool.set_firmware_status = function(firm_info) {
    aztool.firm_info = firm_info;
    // nRF52系であればESP用のメニューを非表示にする
    if (aztool.is_nrf52()) $(".only_esp").css({"display": "none"});
};

// ディスク情報の取得
aztool.load_disk_info = function() {
    // ディスクの空き容量取得
    webhid.get_disk_info(function(disk_data) {
        aztool.disk_data = disk_data;
        // 読み込みが終わったらAZTOOLのメニューページを表示
        aztool.view_top_menu();
        // ファームウェアのバージョンやEEPROMの設定情報を取得（古いAZキーボードだとレスポンスが返ってこない場合がある）
        webhid.get_firmware_status(aztool.set_firmware_status);
    });
};

