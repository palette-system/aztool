// コネクション時などのロード処理 (子端末のデータをロード)

if (!window.aztool) aztool = {};


// BLE の情報
aztool.ble_stat = {
    "host_addr": [0, 0, 0, 0, 0, 0],
    "is_scan": 0, // BLE スキャン中かどうか
    "is_child_connect": 0, // 子端末と接続しているかどうか
    "host_input_length": 0, // 親 端末のキー数
    "child_input_length": 0, // 子 端末のキー数
    "key_input_length": 0 // 合計 端末のキー数
};

// 子端末に接続しているI2C機器の情報
aztool.i2c_option_data_child = {};
aztool.i2c_load_index_child = 0;

// 子端末のKLE情報
aztool.main_kle_data_child_json = "";
aztool.main_kle_data_child = [];

// 子端末の情報取得開始
aztool.load_setting_json_child_start = function(cb_func) {
    if (!cb_func) cb_func = function() {};
    aztool.load_setting_json_child_start_cb = cb_func;
    // 子端末の設定が無ければ何もしない
    if (!aztool.is_child_setting()) return;
    // 子端末 と接続しているか確認
    webhid.get_ble_info(function (ble_stat) {
        aztool.ble_stat = ble_stat;
        if (aztool.ble_stat.is_child_connect) { // 子端末 と接続している
            // aztool.load_setting_json_child(); // 子端末から setting.json i2c_data を読み込む
            aztool.load_kle_data_child(); // 子端末から kle.json を読み込む
        }
    });
};

// 子端末 設定JSONの読み込み
aztool.load_setting_json_child = function(cb_func) {
    if (!cb_func) cb_func = function() {};
    aztool.load_setting_json_child_cb = cb_func;
    webhid.get_child_file(aztool.setting_json_path, function(stat, load_data) {
        // 読み込み失敗
        if (stat != 0) return;
        console.log("get_child_file: " + aztool.setting_json_path + ",  status: " + stat);
        console.log(load_data);
        // 読み込み成功したらデータを受けとる
        let txt = webhid.arr2str(load_data);
        aztool.setting_json_data_child = JSON.parse(txt); // 設定データパース
        console.log(aztool.setting_json_data_child);
        // 別で読み込みが必要なi2cオプションのデータをロード
        aztool.i2c_option_data_child = {};
        aztool.i2c_load_index_child = 0;
        // 設定済みの場合続けて i2c データのロード
        aztool.load_i2c_data_child();
    });
};

// 子端末 i2cデータのロード
aztool.load_i2c_data_child = function() {
    console.log("load_i2c_data_child:" + aztool.i2c_load_index_child);
    // i2cオプションのロード終わったらメニューを表示
    if (!aztool.setting_json_data_child.i2c_option || // i2cの設定が無い
        aztool.i2c_load_index_child >= aztool.setting_json_data_child.i2c_option.length) { // 全てロード完了
            // 本体に保存されているKLEのデータをロード
            aztool.load_kle_data_child();
            return;
    }
    // i2cのデータをロード
    let o = aztool.setting_json_data_child.i2c_option[ aztool.i2c_load_index_child ];
    let t;
    if (o.type == 1 || o.type == 2 || o.type == 5 || o.type == 7) {
        // IOエキスパンダ || I2Cロータリーエンコーダ || AZエキスパンダ
        // kleのJSONロード
        console.log("get_file child: /o" + o.id);
        webhid.get_child_file("/o" + o.id, function(stat, load_data) {
            if (stat != 0) {
                // 読み込み失敗 空のデータを入れる
                aztool.i2c_option_data_child[ "o" + o.id ] = "";
            } else {
                // kleJSON取得
                aztool.i2c_option_data_child[ "o" + o.id ] = webhid.arr2str(load_data);
            }
            // 次のオプションを取得
            aztool.i2c_load_index_child++;
            aztool.load_i2c_data_child();
        });
        return;
    } else if (o.type == 3) {
        // PIM447 トラックボール
        aztool.i2c_option_data_child[ "o" + o.id ] = "[\"\"]";
    } else if (o.type == 4) {
        // PIM447 ロータリー
        aztool.i2c_option_data_child[ "o" + o.id ] = "[{x:1},\"\"],[\"\",\"\",\"\"],[{x:1},\"\"]";
    } else if (o.type == 6) { // KLEが無いオプションは空を入れておく
        // OLED メイン
        aztool.i2c_option_data_child[ "o" + o.id ] = "";
    } else if (o.type == 8) {
        // トラックパッド CST816
        aztool.i2c_option_data_child[ "o" + o.id ] = "[\"\"]";
    } else if (o.type == 9) {
        // AZTOUCH
        aztool.i2c_option_data_child[ "o" + o.id ] = "[\"\", \"\"]";
    }
    // 不明なオプションタイプ
    aztool.i2c_load_index_child++;
    aztool.load_i2c_data_child();
};

// 子端末 本体に保存されているKLEのデータをロード
aztool.load_kle_data_child = function() {
    console.log("load_kle_data: file " + aztool.kle_all_json_path);
    webhid.get_child_file(aztool.kle_all_json_path, function(stat, load_data) {
        console.log("load_kle_data_child: status " + stat);
        // 読み込めていればファイルの内容を保持
        aztool.main_kle_data_child_json = "";
        if (stat == 0) { // 0 読み込み成功 1 何かしらのエラー 2 ファイルが無い
            aztool.main_kle_data_child_json = webhid.arr2str(load_data);
            aztool.main_kle_data_child = JSON.parse(aztool.main_kle_data_child_json);
            console.log(aztool.main_kle_data_child);
        }
        // 取得し終えたらコールバック実行
        aztool.load_setting_json_child_start_cb();
    });
};