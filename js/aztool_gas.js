if (!window.aztool) aztool = {};

// AZTOOL GAS API
aztool.gas_api = "https://script.google.com/macros/s/AKfycby02k83aIZcSPbiwikvsVKcmZuZOjKAPALDjhPxu7WPaXYsKu6EK9XZ0Fb5wQAfgpAP/exec";


// GAS からキーボードリストを取得する
aztool.get_keyboard_list = function(cb_func) {
    if (!cb_func) cb_func = function() {};
    aztool.ajax_array_buffer(
        aztool.gas_api,
        function(stat, res) {
            var i;
            if (stat > 0) return; // エラーだったら何もしない
            // レスポンスからキーボードリストを取得
            var json_str = webhid.arr2str(res.response);
            var json_data = JSON.parse(json_str);
            aztool.setup_keyboard_list = json_data["data"];
            // github の url から画像とZIPのURL生成
            for (i in aztool.setup_keyboard_list) {
                aztool.setup_keyboard_list[i]["url"] = aztool.create_github_url(aztool.setup_keyboard_list[i]["github"]);
            }
            // コールバック関数を実行
            cb_func();
        }
    );
};

// GASにデータ保存する
aztool.save_keyboard_data = function(save_data, cb_func) {
    save_data["type"] = "save";
    aztool.post_array_buffer_gas(
        aztool.gas_api, 
        save_data, 
        function(s,r) {
            if (s) {
                cb_func(s, null);
                return;
            }
            var json_arr = new Uint8Array(r.response);
            var res = JSON.parse(webhid.arr2str(json_arr)); 
            console.log(res);
        }
    );
};
