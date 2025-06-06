// 共通設定データ

if (!window.aztool) aztool = {};

// アクチュエーション設定があるキーボードリスト
aztool.actuation_kb_list = ["az_nubpad", "az_magicpad"];

// 本体のkle
aztool.main_kle = {};

// えむごっちkle
aztool.main_kle["az_emugotch"] = `["0", "1", "2"],
["3", "4", "5"]`;

// AZ-M5ortho kle
aztool.main_kle["az_m5ortho"] = `["7","3","8","12","23","19",{x:3},"39","35","55","51","56","60"],
["6","2","9","13","22","18",{x:3},"38","34","54","50","57","61"],
["5","1","10","14","21","17",{x:3},"37","33","53","49","58","62"],
["4","0","11","15","20","16","24","25","26","36","32","52","48","59","63"]`;

// AZ-Core kle
aztool.main_kle["az_core"] = `["0", "1"],
["2", "3"]`;

// AZ-Core Black kle
aztool.main_kle["az_core_b"] = `[{x:1},"0"],
["3","2","1"],
[{x:1},"4"]`;

// M5Stack AtomS3
aztool.main_kle["atoms3"] = `["0","1","2"]`;

// XIAO ESP32C6
aztool.main_kle["xiao_c6"] = `["0","1","2"]`;

// AZ-Nubpad
aztool.main_kle["az_nubpad"] = `[{x:1},"0"],["1","3","2"]`;

// AZ-Magicpad
aztool.main_kle["az_magicpad"] = `[{x:1},"0","1","2","3"],["4","5","6","7","8"],["9","10","11","12","13"]`;

// AZPOCKET
aztool.main_kle["azpocket"] = `[{x:1},"2"],[{x:1},"4"],["5","3"],["0","1"]`;

// XIAO nRF52840
aztool.main_kle["xiao_ble"] = `["0"]`;

// レイヤー切り替えの種類
// https://qiita.com/chesscommands/items/3e7e02d025f261bf6134
aztool.layer_move_type_list = [
	{"key": 0x50, "value": "[TO] 切り替え後デフォルトになる"},
	{"key": 0x51, "value": "[MO] 押している間切り替わる"},
	{"key": 0x52, "value": "[DF] 切り替え後デフォルトになる"},
	{"key": 0x53, "value": "[TG] 切り替わったままになる"},
	{"key": 0x54, "value": "[OSL] 非対応"}, // 次のキーが入力されるまで指定したレイヤーに移動します。キーが入力されると元のレイヤーに戻ります。
	{"key": 0x58, "value": "[TT] 非対応"} // 単体で押すとMOと同じように押している間レイヤーに移動します。5回押すとTGキーと同じように移動したままになります。
];


