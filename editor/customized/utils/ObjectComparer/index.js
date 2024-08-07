
// https://zhuanlan.zhihu.com/p/470454010
export default class ObjectComparer {
	static ESCAPE_KEYS = []; // 跳过的key名

	static MAX_LOG_COUNT = 99999; // 最多输出条数
	static MAX_KEY_LEN = 50; // 最大键数长度
	static MAX_LEVEL = 10; // 最多深入层数
	static LOG_LEN = 150; // 每行最多显示字符长度

	static TYPE = {
		undefined: { expandable: false, token: "U"},
		null: { expandable: false, token: "E"},
		symbol: { expandable: false, token: "T"},
		boolean: { expandable: false, token: "B"},
		number: { expandable: false, token: "N"},
		string: { expandable: false, token: "S"},
		array: { expandable: true, token: "A"},
		class: { expandable: true, token: "C"},
		function: { expandable: true, token: "F"},
		object: { expandable: true, token: "O"},
	}
	static STATE = {
		same: { style: "background: #242424; padding: 0 4px;" },
		add: { style: "background: #67C23A; padding: 0 4px;" },
		del: { style: "background: #F56C6C; padding: 0 4px;" },
		diff: { style: "background: #E6A23C; padding: 0 4px;" },
		ellipsis: { style: "background: #409EFF; padding: 0 4px;" },
	}
	static SIDE = {
		key: { style: "color: #FFFFFF;" },
		left: { style: "color: #FFFFFF;" },
		right: { style: "color: #FFFFFF;" },
	}

	static sourceObject = null;
	static AddCompareObject(object) {
		if (!ObjectComparer.sourceObject) {
			ObjectComparer.sourceObject = new ObjectComparer(object);
			console.log("Object added. Please add another object to compare.")
		} else {
			const source = ObjectComparer.sourceObject;
			ObjectComparer.sourceObject = null;
			return source.CompareTo(object);
		}
	}
	static ClearCompareObject() {
		ObjectComparer.sourceObject = null;
	}

	object;
	constructor(object) {
		this.object = object;
	}

	CompareTo(target) {
		this.loopLog(this.object, target);
	}

	loopLog(src, tar) {
		const MAX_LOG_COUNT = ObjectComparer.MAX_LOG_COUNT;
		const MAX_KEY_LEN = ObjectComparer.MAX_KEY_LEN;
		const MAX_LEVEL = ObjectComparer.MAX_LEVEL;
		const STATE = ObjectComparer.STATE;
		const TYPE = ObjectComparer.TYPE;
		const ESCAPE_KEYS = ObjectComparer.ESCAPE_KEYS;

		let count = 0;
		const sObjMap = [], tObjMap = []; // 避免循环嵌套
		const levels = [[]]; // 深入的层数
		let stack = levels[0]; // 当前层的栈
		stack.push({ key: "_", src, tar }); // 对比的对象

		let pair = stack.pop();
		while(levels.length > 0) {
			const _key = pair.key;
			const _src = pair.src;
			const _tar = pair.tar;
			const sType = this.getType(_src);
			const tType = this.getType(_tar);
			let state = STATE.same;
			if (sType !== tType) {
				if (sType === TYPE.undefined) state = STATE.add;
				else if (tType === TYPE.undefined) state = STATE.del;
				else state = STATE.diff;
			} else if (!sType.expandable && !tType.expandable && _src !== _tar) {
				state = STATE.diff;
			}
			let sStr = "", tStr = "";
			if (sType !== TYPE.undefined) {
				try {
					sStr = "[" + sType.token + "] " + JSON.stringify(_src);
				} catch(e) {
					sStr = "[" + sType.token + "] " + Object.prototype.toString.call(_src);
				}
			}
			if (tType !== TYPE.undefined) {
				try {
					tStr = "[" + tType.token + "] " + JSON.stringify(_tar);
				} catch(e) {
					tStr = "[" + tType.token + "] " + Object.prototype.toString.call(_tar);
				}
			}

			if (state === STATE.same) {
				if (sStr !== tStr) state = STATE.diff;
			}

			this.log(state, _key, sStr, tStr);
			count++;
			if (count >= MAX_LOG_COUNT) break;

			if (sType.expandable || tType.expandable) {
				console.groupCollapsed("" + _key);
				if (levels.length >= MAX_LEVEL) {
					this.log(STATE.ellipsis, "", "[层级上限]", "[层级上限]");
					stack = [];
					levels.push(stack);
				} else {
					const wrapSrc = sType.expandable ? _src : {};
					const wrapTar = tType.expandable ? _tar : {};

					const loggedSrc = sType.expandable ? sObjMap.includes(_src) : false;
					const loggedTar = tType.expandable ? tObjMap.includes(_tar) : false;

					if (!loggedSrc && sType.expandable) sObjMap.push(_src);
					if (!loggedTar && tType.expandable) tObjMap.push(_tar);

					let sKeys, tKeys;
					sKeys = sType.expandable ? Object.getOwnPropertyNames(_src) : [];
					sKeys = sKeys.slice(0, MAX_KEY_LEN);
					tKeys = tType.expandable ? Object.getOwnPropertyNames(_tar) : [];
					tKeys = tKeys.slice(0, MAX_KEY_LEN);

					const keyMap = {};
					for (let i=0; i<sKeys.length; i++) keyMap[sKeys[i]] = true;
					for (let i=0; i<tKeys.length; i++) keyMap[tKeys[i]] = true;
					const newStack = [];

					if (loggedSrc && loggedTar) {
						this.log(STATE.ellipsis, "", "[重复引用]", "[重复引用]");
					} else {
						for (let k in keyMap) {
							if (ESCAPE_KEYS.includes(k)) continue;
							newStack.push({ key: k, src: loggedSrc ? "[重复引用]" : wrapSrc[k], tar: loggedTar ? "[重复引用]" : wrapTar[k] });
						}
					}
					stack = newStack;
					levels.push(newStack);
				}
			}

			pair = stack.pop();
			while(!pair && levels.length > 0) {
				levels.pop();
				console.groupEnd();
				stack = levels[levels.length - 1];
				if (!stack) {
					pair = undefined;
					break;
				}
				pair = stack.pop();
			}
		}

		if (count >= MAX_LOG_COUNT) {
			for (let i=0; i<levels.length; i++) console.groupEnd();
			this.log(STATE.ellipsis, "", "[输出上限]", "[输出上限]");
		}
	}

	getType(obj) {
		const TYPE = ObjectComparer.TYPE;
		const typeString = Object.prototype.toString.call(obj).toLowerCase();
		if (typeString === '[object undefined]') return TYPE.undefined;
		if (typeString === '[object null]') return TYPE.null;
		if (typeString === '[object symbol]') return TYPE.symbol;
		if (typeString === '[object boolean]') return TYPE.boolean;
		if (typeString === '[object number]') return TYPE.number;
		if (typeString === '[object string]') return TYPE.string;
		if (typeString === '[object array]') return TYPE.array;
		if (typeString === '[object function]') {
			if (Object.getOwnPropertyDescriptor(obj, "arguments")) return TYPE.function;
			return TYPE.class;
		}
		return TYPE.object;
	}

	log(state, pre, src, tar) {
		const LOG_LEN = ObjectComparer.LOG_LEN;
		const SIDE = ObjectComparer.SIDE;

		const len = Math.floor(LOG_LEN / 5);
		pre = this.fixStrLen(pre.trim().replaceAll("\n", "\\n"), len);
		src = this.fixStrLen(src.trim().replaceAll("\n", "\\n"), len * 2);
		tar = this.fixStrLen(tar.trim().replaceAll("\n", "\\n"), len * 2);
		const params = [
			"%c" + pre + ": %c" + "%c" + src + "%c | %c" + tar + "%c",
			state.style + SIDE.key.style, state.style,
			state.style + SIDE.left.style, state.style,
			state.style + SIDE.right.style, state.style,
		];
		console.log(...params);
	}

	fixStrLen(str, len) {
		if (str.length > len) return str.substr(0, len - 4) + " ...";
		const diff = len - str.length;
		for (let i=0; i<diff; i++) str += " ";
		return str;
	}
}
