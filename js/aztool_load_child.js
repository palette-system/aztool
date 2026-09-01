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
            aztool.load_kle_data_child(); // 子端末から kle.json を読み込む
        }
    });
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