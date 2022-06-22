/* =============================

～ UE4.23 HTML5ゲームを無理やりゲームパッドに対応させる簡易ライブラリ ～

(c)2022 by Emily&Charlotte Lounge
https://emilycharlotte.jp/

バージョン 0.7.0.3
作成日 2022-06-19
更新日 2022-06-22

■ライセンス(めんどくさいので簡単に)

・サポートも保障も補償もしませんが、権利は放棄しません。
・このスクリプト単体での転載、再配布、販売等は禁止(改変してても駄目)。
・ブログ等の技術的な記事で部分的に引用することは可。
・使用に際し改変することは自由。不要な部分やコメントを削除してもOK。
・このスクリプトを使用したゲームやウェブコンテンツの配信は無償、有償いずれも可。
・クレジット表示や使用報告は不要。

■仕組み

Unbreal Engine 4の4.23(4.24ではコミュニティによる対応)は標準でHTML5(WebGL)出力に
対応していますが、ゲームパッドでの操作ができません。

このスクリプトではゲームパッドの状態を監視し、入力があればそれに対応した
キーボードのイベントを発生させることで、UE4にキー入力があったと
錯覚させることでゲームパッドによる操作を可能とします。

■使用するもの

・UE4.23.1 (他のバージョンは未確認)
・Firefox、Chrome、Edge (いずれも2022-06-19時点のバージョン)
・UTF-8対応のいい感じのテキストエディタ

■使い方

1.  UEからShipping設定でプロジェクトのHTML5パッケージ化を行います。

2.  "ue4html5_gamepad_to_keyboard.js"ファイルを"プロジェクト名.html"と
    同じフォルダにコピーします。

3.  "ue4html5_gamepad_to_keyboard.js"の途中にあるue4html5_gamepadKeyboardLinkを
    見つけて必要に応じて書き換えます。

4.  出力された"プロジェクト名.html"の後ろのほうにある下記行を見つけます。
    <script src="プロジェクト名-HTML5-Shipping.UE4.js"></script>

5.  4で見つけた行の次の行に下記を追加します。
    <script src="ue4html5_gamepad_to_keyboard.js"></script>

6.  まずはローカル環境で正しく動作するか確認してください。

■制限

・趣味で作ったものなのでサポートは期待しないでください。

・組み込みやすさ重視で1ファイルにまとめてます。

・UE側の作り方や、クライアントの環境によっては正しく動作しない場合があります。

・めんどくさいのでキーリストはWindowsのJPキーボードのしか用意してません。

・必ずしもすべてのキーに対応できるというわけではありません。
  できればUE側にキーボード操作とゲームパッド操作を切り替える機能を設け、
  ゲームパッドのキーマッピングをフルキーのA～Zに集中させるといった方法を
  とってください(JPやUSキーボードならA～Zは確実に取れるので)。

・ゲームパッドの入力をキーボード入力に置き換えるため、アナログスティックや
  トリガー等の滑らかな変化には非対応です。
  たとえば、左スティックが上方向に倒されたら、入力値が0.5以上ならWキー、
  0.5未満ならSHIFT+Wキーのような対応になります。

・左右トリガーはアナログではなくオン|オフのみです。

・UE側のHTML5パッケージ化の仕様上、SHIFT、CTRL、ALT等の左右の区別はできません。

・ゲームパッドの入力からキーイベント発生まで、数フレームの遅延があります。
  同時に押したボタンが多いほど遅延も大きくなります。

・プレイヤーによるカスタマイズ機能は用意されていません。
  キーマッピング情報は変数に格納されているので、独自にjavascriptでキー設定
  ダイアログを出すなどして対応させることは可能です(UE側にポーズ機能も必要)。
  もしくはUE側にキー設定機能を持たせて、ajax等のローカル通信でjavascript側に
  設定を送り込むという方法も使えるかもしれません(試してませんが)。

============================= */


/* =============================
	設定
============================= */

// キーボードのコードリスト
// 
// UE側のキーリストは↓にありますが、それがすべて使えるわけではありません。
// Engine/Source/Runtime/InputCore/Classes/InputCoreTypes.h
// 
// ue4html5_keyCodeList[OS][言語][code] { keyCode, key }
// 
let ue4html5_keyCodeList = {
	"Windows": {
		"JP": {
			"undefined": [ -1, "" ],
			"Shift": [ 16, "Shift" ],
			"ShiftLeft": [ 16, "Shift" ],
			"ShiftRight": [ 16, "Shift" ],
			"LeftShift": [ 16, "Shift" ],
			"RightShift": [ 16, "Shift" ],
			"Control": [ 17, "Control" ],
			"ControlLeft": [ 17, "Control" ],
			"ControlRight": [ 17, "Control" ],
			"LeftControl": [ 17, "Control" ],
			"RightControl": [ 17, "Control" ],
			"Alt": [ 18, "Alt" ],
			"AltLeft": [ 18, "Alt" ],
			"AltRight": [ 18, "Alt" ],
			"LeftAlt": [ 18, "Alt" ],
			"RightAlt": [ 18, "Alt" ],
			"Backspace": [ 8, "Backspace" ],
			"Tab": [ 9, "Tab" ],
			"Enter": [ 13, "Enter" ],
			"Pause": [ 19, "Pause" ],
			"CapsLock": [ 20, "CapsLock" ],
			"Escape": [ 27, "Escape" ],
			"Space": [ 32, " " ],
			"PageUp": [ 33, "PageUp" ],
			"PageDown": [ 34, "PageDown" ],
			"End": [ 35, "End" ],
			"Home": [ 36, "Home" ],
			"ArrowLeft": [ 37, "ArrowLeft" ],
			"ArrowUp": [ 38, "ArrowUp" ],
			"ArrowRight": [ 39, "ArrowRight" ],
			"ArrowDown": [ 40, "ArrowDown" ],
			"Left": [ 37, "ArrowLeft" ],
			"Up": [ 38, "ArrowUp" ],
			"Right": [ 39, "ArrowRight" ],
			"Down": [ 40, "ArrowDown" ],
			"PrintScreen": [ 44, "PrintScreen" ],
			"Insert": [ 45, "Insert" ],
			"Delete": [ 46, "Delete" ],
			"Digit0": [ 48, "0" ],
			"Digit1": [ 49, "1" ],
			"Digit2": [ 50, "2" ],
			"Digit3": [ 51, "3" ],
			"Digit4": [ 52, "4" ],
			"Digit5": [ 53, "5" ],
			"Digit6": [ 54, "6" ],
			"Digit7": [ 55, "7" ],
			"Digit8": [ 56, "8" ],
			"Digit9": [ 57, "9" ],
			"KeyA": [ 65, "a" ],
			"KeyB": [ 66, "b" ],
			"KeyC": [ 67, "c" ],
			"KeyD": [ 68, "d" ],
			"KeyE": [ 69, "e" ],
			"KeyF": [ 70, "f" ],
			"KeyG": [ 71, "g" ],
			"KeyH": [ 72, "h" ],
			"KeyI": [ 73, "i" ],
			"KeyJ": [ 74, "j" ],
			"KeyK": [ 75, "k" ],
			"KeyL": [ 76, "l" ],
			"KeyM": [ 77, "m" ],
			"KeyN": [ 78, "n" ],
			"KeyO": [ 79, "o" ],
			"KeyP": [ 80, "p" ],
			"KeyQ": [ 81, "q" ],
			"KeyR": [ 82, "r" ],
			"KeyS": [ 83, "s" ],
			"KeyT": [ 84, "t" ],
			"KeyU": [ 85, "u" ],
			"KeyV": [ 86, "v" ],
			"KeyW": [ 87, "w" ],
			"KeyX": [ 88, "x" ],
			"KeyY": [ 89, "y" ],
			"KeyZ": [ 90, "z" ],
			"Numpad0": [ 96, "0" ],
			"Numpad1": [ 97, "1" ],
			"Numpad2": [ 98, "2" ],
			"Numpad3": [ 99, "3" ],
			"Numpad4": [ 100, "4" ],
			"Numpad5": [ 101, "5" ],
			"Numpad6": [ 102, "6" ],
			"Numpad7": [ 103, "7" ],
			"Numpad8": [ 104, "8" ],
			"Numpad9": [ 105, "9" ],
			"NumpadAdd": [ 107, "+" ],
			"NumpadComma": [ 194, "," ],
			"NumpadDecimal": [ 110, "." ],
			"NumpadDivide": [ 111, "/" ],
			"NumpadMultiply": [ 106, "*" ],
			"NumpadSubtract": [ 109, "-" ],
			"NumpadEqual": [ 12, "=" ],
			"NumpadEnter": [ 13, "Enter" ],
			"NumLock": [ 144, "NumLock" ],
			"ScrollLock": [ 145, "ScrollLock" ],
			"Quote": [ 186, "'" ],
			"Semicolon": [ 187, ";" ],
			"Comma": [ 188, "," ],
			"Minus": [ 189, "-" ],
			"Period": [ 190, "." ],
			"BracketLeft": [ 192, "[" ],
			"BracketRight": [ 219, "]" ],
			"Backslash": [ 221, "\\" ],
			"Equal": [ 222, "=" ],
			"IntlYen": [ 220, "\\" ],
			"F1": [ 112, "F1" ],
			"F2": [ 113, "F2" ],
			"F3": [ 114, "F3" ],
			"F4": [ 115, "F4" ],
			"F5": [ 116, "F5" ],
			"F6": [ 117, "F6" ],
			"F7": [ 118, "F7" ],
			"F8": [ 119, "F8" ],
			"F9": [ 120, "F9" ],
			"F10": [ 121, "F10" ],
			"F11": [ 122, "F11" ],
			"F12": [ 123, "F12" ],
			"F13": [ 124, "F13" ],
			"F14": [ 125, "F14" ],
			"F15": [ 126, "F15" ],
			"F16": [ 127, "F16" ],
			"F17": [ 128, "F17" ],
			"F18": [ 129, "F18" ],
			"F19": [ 130, "F19" ],
			"F20": [ 131, "F20" ],
			"F21": [ 132, "F21" ],
			"F22": [ 133, "F22" ],
			"F23": [ 134, "F23" ],
			"F24": [ 135, "F24" ],
		},
		"US": {
		},
	},
	"Linux": {
	},
	"Mac": {
	},
	"Other": {
	},
};

// ゲームパッドのボタンインデックスとステータス
// 
// 参照 - https://w3c.github.io/gamepad/
// status 0=押されていない、1=Low、2=High。
// 
// ue4html5_gamepadInputList[ボタン|スティック][ボタン名] { index, status }
// 
let ue4html5_gamepadInputList = {
	"Button": {
		"undefined": [ -1, 0 ],
		"A": [ 0, 0 ],
		"B": [ 1, 0 ],
		"X": [ 2, 0 ],
		"Y": [ 3, 0 ],
		"LB": [ 4, 0 ],
		"RB": [ 5, 0 ],
		"LT": [ 6, 0 ],
		"RT": [ 7, 0 ],
		"Back": [ 8, 0 ],
		"Start": [ 9, 0 ],
		"StickL": [ 10, 0 ],
		"StickR": [ 11, 0 ],
		"Up": [ 12, 0 ],
		"Down": [ 13, 0 ],
		"Left": [ 14, 0 ],
		"Right": [ 15, 0 ],
		"Home": [ 16, 0 ],
	},
	"Stick": {
		"undefined": [ -1, 0 ],
		"-LeftX": [ 0, 0 ],
		"+LeftX": [ 0, 0 ],
		"-LeftY": [ 1, 0 ],
		"+LeftY": [ 1, 0 ],
		"-LeftZ": [ -1, 0 ],
		"+LeftZ": [ -1, 0 ],
		"-RightX": [ 2, 0 ],
		"+RightX": [ 2, 0 ],
		"-RightY": [ 3, 0 ],
		"+RightY": [ 3, 0 ],
		"-RightZ": [ -1, 0 ],
		"+RightZ": [ -1, 0 ],
	},
};

// ゲームパッドとキーボードのリンク情報
// 
// "Deadzone"は0.0～1.0で指定。入力値(の絶対値)がこの値を超えた場合、入力ありと判定。
// "Threshold"は0.0～1.0で指定。0なら"High"のみ使用
// "High"はしきい値以上、"Low"はしきい値未満。
// [キーのリスト]は配列で同時押しするキー(ue4html5_keyCodeListのcode値)を列挙します。
// ※[キーのリスト]は仕組みの都合上、正確には同時押しではなく並んだ順に個別に処理します。
//   初期設定ではテストで画面表示させるためにAlt等の修飾キーを後に書いてますが、
//   ゲームで実際に使用する際は先に書いたほうがいいです。
// 
// ue4html5_gamepadKeyboardLink[ボタン|スティック][ボタン名] { "Deadzone": 最低値, "Threshold": しきい値, "High": [キーのリスト], "Low": [キーのリスト] }
// 
let ue4html5_gamepadKeyboardLink = {
	"Button": {
		"A": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["Space"], "Low": [] },
		"B": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyC"], "Low": [] },
		"X": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyF"], "Low": [] },
		"Y": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyR"], "Low": [] },
		"LB": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyQ"], "Low": [] },
		"RB": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyE"], "Low": [] },
		"LT": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyZ"], "Low": [] },
		"RT": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyX"], "Low": [] },
		"Back": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["Backspace"], "Low": [] },
		"Start": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["Enter"], "Low": [] },
		"StickL": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["ShiftLeft"], "Low": [] },
		"StickR": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["ControlLeft"], "Low": [] },
		"Up": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyI"], "Low": [] },
		"Down": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyK"], "Low": [] },
		"Left": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyJ"], "Low": [] },
		"Right": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["KeyL"], "Low": [] },
		"Home": { "Deadzone": 0.1, "Threshold": 0.0, "High": ["Escape"], "Low": [] },
	},
	"Stick": {
		"-LeftX": { "Deadzone": 0.1, "Threshold": 0.4, "High": ["KeyA", "AltLeft"], "Low": ["KeyA"] },
		"+LeftX": { "Deadzone": 0.1, "Threshold": 0.4, "High": ["KeyD", "AltLeft"], "Low": ["KeyD"] },
		"-LeftY": { "Deadzone": 0.1, "Threshold": 0.4, "High": ["KeyW", "AltLeft"], "Low": ["KeyW"] },
		"+LeftY": { "Deadzone": 0.1, "Threshold": 0.4, "High": ["KeyS", "AltLeft"], "Low": ["KeyS"] },
		"-LeftZ": { "Deadzone": 0.1, "Threshold": 0.0, "High": [], "Low": [] },
		"+LeftZ": { "Deadzone": 0.1, "Threshold": 0.0, "High": [], "Low": [] },
		"-RightX": { "Deadzone": 0.1, "Threshold": 0.6, "High": ["ArrowLeft", "Period"], "Low": ["ArrowLeft"] },
		"+RightX": { "Deadzone": 0.1, "Threshold": 0.6, "High": ["ArrowRight", "Period"], "Low": ["ArrowRight"] },
		"-RightY": { "Deadzone": 0.1, "Threshold": 0.6, "High": ["PageDown", "Period"], "Low": ["PageDown"] },
		"+RightY": { "Deadzone": 0.1, "Threshold": 0.6, "High": ["PageUp", "Period"], "Low": ["PageUp"] },
		"-RightZ": { "Deadzone": 0.1, "Threshold": 0.0, "High": [], "Low": [] },
		"+RightZ": { "Deadzone": 0.1, "Threshold": 0.0, "High": [], "Low": [] },
	},
};


/* =============================
	変数
============================= */

let ue4html5_keyboardLang = "JP";
let ue4html5_keyboardOS = "Windows";
let ue4html5_gamepadType = "Xbox360";
let ue4html5_gamepadScanInterval = 500;					// ゲームパッドの接続状態を監視する間隔(msec) ※Chromeで必要らしい
let ue4html5_continuousKeyDownEvent = true;				// trueなら押されている間はkeyDownイベントを発行し続ける
let ue4html5_gamepadReady = false;						// 初期化が完了したらtrue

/* =============================
	いわゆるAPI
============================= */

// ゲームパッドの処理を開始
// 
// 呼		なし
// 返		なし
// 
function ue4html5_enableGamepad() {
	window.addEventListener("gamepadconnected", ue4html5_connecthandler);
	window.addEventListener("gamepaddisconnected", ue4html5_disconnecthandler);
	if(!ue4html5_haveEvents) setInterval(ue4html5_scangamepads, ue4html5_gamepadScanInterval);
	ue4html5_resetGamepadButtonStatus();
	ue4html5_gamepadReady = true;
};

// ゲームパッドのボタンステータスをクリア
// 
// 呼		なし
// 返		なし
// 
function ue4html5_resetGamepadButtonStatus() {
	for(let [key0, value] of Object.entries(ue4html5_gamepadInputList)) {
		for(let [key1, value] of Object.entries(ue4html5_gamepadInputList[key0])) {
			ue4html5_gamepadInputList[key0][key1][1] = 0;
		}
	}
};

/* =============================
	キーボード処理
============================= */

// キー名称からキーコード配列を取得
// 
function ue4html5_getKeyCode(name) {
	let v = ue4html5_keyCodeList[ue4html5_keyboardOS][ue4html5_keyboardLang][name];
	return [ v[0], v[1] ];
};

// キー名称からキー入力イベントを発行
// 
function ue4html5_dispatchKeyEvent(name, mode = null, elem = null) {
	let key = ue4html5_getKeyCode(name);
	if((key === undefined)||(key === null)) return;
	if((mode === undefined)||(mode === null)) mode = "keydown";
	if((elem === undefined)||(elem === null)) elem = window;	// document
	var ue4html5_k0 = key[0];
	var ue4html5_k1 = key[1];
	elem.dispatchEvent(
		new KeyboardEvent(
			mode, 
			{
				charCode: 0,
				char: name,
				code: name,
				key: ue4html5_k1,
				keyCode: ue4html5_k0,
				which: ue4html5_k0,
				detail: 0,
				eventPhase: 3,
				isTrusted: true,
				location: 0,
				returnValue: true,
			}
		)
	);
};

/* =============================
	ゲームパッド処理
	参照 - https://developer.mozilla.org/ja/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
============================= */

let ue4html5_haveEvents = 'ongamepadconnected' in window;
let ue4html5_controllers = {};

// ゲームパッドを登録
// 
function ue4html5_addgamepad(gamepad) {
	ue4html5_controllers[gamepad.index] = gamepad;
	requestAnimationFrame(ue4html5_updateStatus);
}

// ゲームパッドの登録解除
// 
function ue4html5_removegamepad(gamepad) {
	delete ue4html5_controllers[gamepad.index];
}

// ゲームパッド接続イベント
// 
function ue4html5_connecthandler(e) {
	ue4html5_addgamepad(e.gamepad);
}

// ゲームパッド切断イベント
// 
function ue4html5_disconnecthandler(e) {
	ue4html5_removegamepad(e.gamepad);
}

// ゲームパッドのボタンの状態
// 
function ue4html5_buttonPressed(b) {
	if(typeof(b) === "object") return b.pressed ? 1.0 : 0.0;
	return b;
}

// ゲームパッドの入力チェック
// 
function ue4html5_updateStatus() {
	if(!ue4html5_gamepadReady) return;
	if(!ue4html5_haveEvents) ue4html5_scangamepads();
	if((ue4html5_controllers === undefined)||(ue4html5_controllers === null)) return;
	if((ue4html5_controllers[0] === undefined)||(ue4html5_controllers[0] === null)) return;
	let k = null;
	let s = null;
	let i = 0;
	let n = 0;
	let v = 0.0;
	let b = 0.0;
	let t = "";
	let gp = ue4html5_controllers[0];
	for(let [key0, value] of Object.entries(ue4html5_gamepadInputList)) {
		for(let [key1, value] of Object.entries(ue4html5_gamepadInputList[key0])) {
			s = ue4html5_gamepadInputList[key0][key1];
			k = ue4html5_gamepadKeyboardLink[key0][key1];
			n = s[0];
			if(n >= 0) {
				if(key0 === "Button") {
					v = ue4html5_buttonPressed(gp.buttons[n]);
				}
				else {
					v = gp.axes[n];
					if(key1.substr(0, 1) === "+") {
						if(v < 0.0) v = 0.0;
					}
					else {
						if(v > 0.0) v = 0.0;
					}
				}
				b = Math.abs(v);
				t = (b < k["Threshold"]) ? "Low" : "High";
				if(b < k["Deadzone"]) {		// keyUp
					if(s[1] > 0) {
						for(i=0; i<k["Low"].length; i++) ue4html5_dispatchKeyEvent(k["Low"][i], "keyup");
						for(i=0; i<k["High"].length; i++) ue4html5_dispatchKeyEvent(k["High"][i], "keyup");
					}
					s[1] = 0;
				}
				else {						// keyDown
					if((t === "High")&&(s[1] === 1)) {
						for(i=0; i<k["Low"].length; i++) ue4html5_dispatchKeyEvent(k["Low"][i], "keyup");
						s[1] = 0;
					}
					else if((t === "Low")&&(s[1] === 2)) {
						for(i=0; i<k["High"].length; i++) ue4html5_dispatchKeyEvent(k["High"][i], "keyup");
						s[1] = 0;
					}
					if((s[1] < 1)||(ue4html5_continuousKeyDownEvent)) {
						for(i=0; i<k[t].length; i++) ue4html5_dispatchKeyEvent(k[t][i], "keydown");
					}
					s[1] = (t === "Low") ? 1 : 2;
				}
			}
		}
	}
	requestAnimationFrame(ue4html5_updateStatus);
}

// ゲームパッドの接続状態を監視 ※Chromeで必要らしい
// 
function ue4html5_scangamepads() {
	let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
	for(let i=0; i<gamepads.length; i++) {
		if(gamepads[i]) {
			if(gamepads[i].index in ue4html5_controllers) {
				ue4html5_controllers[gamepads[i].index] = gamepads[i];
			} else {
				ue4html5_addgamepad(gamepads[i]);
			}
		}
	}
}

// ゲームパッドイベント登録
// 
ue4html5_enableGamepad()

//==============================
