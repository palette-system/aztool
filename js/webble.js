

webble = {};

// UUID
webble.custam_service_id = "0000ff01-0000-1000-8000-00805f9b34fb";
webble.custam_input_id = "0000ff02-0000-1000-8000-00805f9b34fb";
webble.custam_output_id = "0000ff03-0000-1000-8000-00805f9b34fb";

// デバイス検索オプション
webble.device_search_option = {
    filters: [
        { services: [webble.custam_service_id]},
        { namePrefix: "X" }
    ]
};

// WEB Bluetooth モードかどうか
webble.webble_mode = false;

// 送受信のパケットサイズ
webble.command_size = 32;

// 受信、送信用 Characteristic
webble.ble_device = null;
webble.ble_server = null;
webble.ble_service = null;
webble.ble_output = null;
webble.ble_input = null;

// Web Bluetooth 有効化
webble.enable = function() {
    // WEBHID のメソッドを WEB Bluetooth 用のメソッドで上書く
    webhid.init = webble.init; // 初期化
    webhid.connect = webble.connect; // 接続メソッド
    webhid.send_command = webble.send_command; // コマンド送信
    webhid.close = webble.close; // 切断メソッド
    webble.webble_mode = true;
};

// WEB Bluetooth 初期化
webble.init = function(opt) {
    // オプションを受け取る
    let k;
    for (k in opt) {
        webhid[k] = opt[k];
    }
    // crcテーブル作成
    webhid.crc_table = webhid.get_crctable();
    // 接続イベント登録
    // navigator.hid.addEventListener("connect", webhid.handle_connect);
    // 接続終了イベント登録
    // navigator.hid.addEventListener("disconnect", webhid.handle_disconnect);
};


// WEB Bluetooth へ接続
webble.connect = function(cb_func) {
    // デバイス情報設定
    webhid.raw_report_id = {
        "in": 1,
        "in_size": webble.command_size,
        "out": 2,
        "out_size": webble.command_size
    };
    // デバイス検索
    navigator.bluetooth.requestDevice(webble.device_search_option)
    .then(device => {
        webble.ble_device = device;
        return webble.ble_device.gatt.connect(); // デバイスへ接続
    })
    .then(server => {
        webble.ble_server = server;
        console.log("server");
        console.log(server);
        return webble.ble_server.getPrimaryService(webble.custam_service_id); // サービス取得
    })
    .then(service => {
        webble.ble_service = service;
        console.log("service");
        console.log(service);
        return webble.ble_service.getCharacteristic(webble.custam_input_id); // シリアル 受信
    })
    .then(characteristic_input => {
        webble.ble_input = characteristic_input;
        console.log("characteristic_input");
        console.log(characteristic_input);
        return webble.ble_input.startNotifications(); // 通知開始
    })
    .then(n => {
        console.log("n");
        console.log(n);
        // イベントの種類
        // https://webbluetoothcg.github.io/web-bluetooth/#eventdef-bluetoothremotegattcharacteristic-characteristicvaluechanged
        webble.ble_input.addEventListener('characteristicvaluechanged', webble.handle_input_report); // 通知受け取った時に実行する関数登録
        return webble.ble_service.getCharacteristic(webble.custam_output_id); // シリアル 送信
    })
    .then(characteristic_output => {
        webble.ble_output = characteristic_output;
        console.log("characteristic_output");
        console.log(characteristic_output);
        // コールバック実行
        cb_func(0); // 0 = 成功
    })
    .catch(error => {
        console.log(error);
        cb_func(2); // 2 = 接続失敗
    });
};

// WEB Bluetooth 切断
webble.close = function(cb_func) {
    webble.ble_server.disconnect();
    cb_func();
};

// コマンドを送信
webble.send_command = function(arr) {
    var i;
    var b = new ArrayBuffer(arr.length);
    var u = new Uint8Array(b);
    for (i=0; i<arr.length; i++) {
        u[i] = arr[i];
    }
    console.log(arr);
    return webble.ble_output.writeValue(b);
};

// データを受け取った時のイベント
webble.handle_input_report = function(event) {
    console.log(event);
    webhid.handle_input_report({
        "reportId": 1,
        "data": event.target.value
    });
};





// データを受け取った時のイベント
webhid.handle_input_report = function(e) {
    // 全てのポートのインプットでこのイベントが発生するのでraw以外のポートのイベントは無視
    if (e.reportId != webhid.raw_report_id.in) return;
    // データをUint8Arrayにする
    let get_data = new Uint8Array(e.data.buffer);
    // console.log("get");
    console.log(get_data);
    let cmd_type = get_data[0];
    let cmd;
    let i, h, p, r, u, s;
    if (cmd_type == webhid.command_id.file_load_start) {
        // ファイル読み込み開始(ファイル有無と容量が帰って来る)
        if (!get_data[1]) { // ファイルが無い
            webhid.load_file_path = ""; // 読み込み終わり
            webhid.view_info("ファイルが存在しませんでした。");
            webhid.get_file_cb_func(2, []);
            return;
        }
        // ファイルの容量取得
        s = (get_data[2] << 24) + (get_data[3] << 16) + (get_data[4] << 8) + get_data[5];
        // 読み込み開始
        webhid.load_start_exec(s, webhid.get_file_cb_func);

    } 
    
};
