//@ app.js
let global_animation_id =0;
new App().run(new AScreen(window.innerWidth, window.innerHeight).run());

function App(){
	this.run=(aScreen)=>{
		console.log("window width:", window.screen.width, window.innerWidth);
		new CtxCompanyVacs().run(aScreen);
	}
}

function CtxCompanyVacs(){
	this.id =this.constructor.name;
	let _ws =200,_hs =30,_ts =10,_ls =50;
	let _we=500,_he=500,_te=0,_le=0;
	let _vacsApp;
	let _vacsApp_counter =0;
	this.run=(aScreen)=>{
		this.aScreen =aScreen;
		this.smDom =new SmartDiv().run({w:_ws,h:_hs,t:_ts,l:_ls,"z":100,pos: "absolute",background: "#cef","text-align": "center","line-height": _hs+"px", cursor:"pointer", border:"1px solid gray"});
		this.smDom.dom.innerHTML ="Поиск вакансий";
		aScreen.add(this.id, this.smDom.dom);
		setTimeout(()=>{
			activate();
		}, 200);
		//this.smDom.onclick(activate);
	}
	const activate=(evt)=>{
		const sizes =this.aScreen.sizes();
		_we =sizes.w;
		_he =sizes.h;
		console.log("CtxCompanyVacs: _we, _he, _te, _le =", _we, _he, _te, _le);
		inactivate();
		this.smDom.change_size(10, _we, _he, _te, _le, ()=>{
			_vacsApp =new VacsApp(_vacsApp_counter+=1).run(this.smDom, close_listener);
		});
	}
	const inactivate=()=>{
		this.smDom.onclick(false);
		this.smDom.dom.innerHTML ="";
	}
	const close_listener=()=>{
		alert("VacsApp was closed!");
	}
}

function VacsApp(id){
	this.id =id;
	let _ws =200,_hs =30,_ts =10,_ls =50;
	let _labeledInput;
	let _input_value ="1029900507560";
	let _textArea;
	this.run=(parSmDom, parent_cb)=>{
		const par_rect =parSmDom.get_rect();
		correct_this_sizes(par_rect);
		this.smDom =new SmartDiv().run({w:_ws,h:_hs,t:_ts,l:_ls,pos: "relative", border:"1px solid gray"});
		parSmDom.append(this.smDom.dom);
		add_label_and_input();
		add_send_button();
		add_copy_button();
	};
	const correct_this_sizes=(rect)=>{
		_ws =rect.w-80;
		_hs =rect.h-80;
		_ts =rect.t+40;
		_ls =rect.l+40;
	}
	const add_label_and_input=()=>{
		_labeledInput =new LabeledInput("ID Организации");
		_labeledInput.run(this.smDom, {top:20, left:20}, (value)=>{
			_input_value =value;
		});
		_labeledInput.set_default(_input_value);
		_textArea =new TextArea().run(this.smDom, {top:140, left:20}, (ondata)=>{
			//@
		});
	}
	const add_send_button=()=>{
		const _button = new SmartButton("Запрос").run(this.smDom, {top:80, left:20}, (is_pressed)=>{
			xml_http_request("api/vacs/"+_input_value, "bbody", "GET", (err, res)=>{
				if(res){
					const str_for_excel =parse_json_to_str_for_excel(res);
					_textArea.set_val(str_for_excel);
				}
			});
			//alert("ok");
		});
	}
	const add_copy_button=()=>{
		const _button = new SmartButton("Скопировать").run(this.smDom, {top:80, left:200}, (is_pressed)=>{
			//alert("!")
			_textArea.dom().select();
			document.execCommand('copy');
			//alert("ok");
		});
	}
	const parse_json_to_str_for_excel=(json_str)=>{
		const json =JSON.parse(json_str);
		if(typeof json != "object" || !json.results || !json.results.vacancies){
			return "Нет данных"
		}else{
			const EMPTYSTR ="";
			const DIVIDER ="\t";
			const EOL ="\r\n";
			const map_table ={companycode: "Код компании", inn: "ИНН", kpp: "КПП", name: "", inn: "", inn: "", inn: "", inn: "", inn: "", "creation-date": "Дата создания", salary: "ЗП", salary_min: "ЗП мин", salary_max: "ЗП макс", 
			}
			const hat =["ID вакансии", "Регион", "Код орг-ции", "почта орг-ции", "ИНН", "КПП", "Наименование орг-ции", "ОГРН", "телефон", "ссылка орг-ции", "Дата создания", "ЗП", "Зп мин", "ЗП макс", "Вакансия", "ссылка вакансии", "Занятость", "График", "Обязанности", "Специализация", "Образование", "Опыт (лет)", "Адрес вакансии", "Соц-защищенный", "Контактное лицо", "валюта"];
			let res =hat.join(DIVIDER) + EOL;
			
			console.log("typeof json=", typeof json);
			console.log("json=", json);
			
			const vacs_arr =json.results.vacancies;
			vacs_arr.forEach(vac_dto=>{
				const vac =vac_dto.vacancy;
				//@ 1. ID вакансии
				res += (vac.id ? vac.id : "") + DIVIDER;
				//@ 2. Регион
				res += ((vac.region && vac.region.name) ? vac.region.name : EMPTYSTR) + DIVIDER;
				//@ 3. Код орг-ции
				res += (vac.company&&vac.company.companycode ? vac.company.companycode : EMPTYSTR) + DIVIDER;
				//@ 4. почта орг-ции
				res += (vac.company&&vac.company.email ? vac.company.email : EMPTYSTR) + DIVIDER;
				//@ 5. ИНН
				res += (vac.company&&vac.company.inn ? vac.company.inn : EMPTYSTR) + DIVIDER;
				//@ 6. КПП
				res += (vac.company&&vac.company.kpp ? vac.company.kpp : EMPTYSTR) + DIVIDER;
				//@ 7. Наименование орг-ции
				res += (vac.company&&vac.company.name ? vac.company.name : EMPTYSTR) + DIVIDER;
				//@ 8. ОГРН
				res += (vac.company&&vac.company.ogrn ? vac.company.ogrn : EMPTYSTR) + DIVIDER;
				//@ 9. телефон орг-ции
				res += (vac.company&&vac.company.phone ? vac.company.phone : EMPTYSTR) + DIVIDER;
				//@ 10. ссылка орг-ции
				res += (vac.company&&vac.company.url ? vac.company.url : EMPTYSTR) + DIVIDER;
				//@ 11. Дата создания
				res += (vac["creation-date"] ? vac["creation-date"] : EMPTYSTR) + DIVIDER;
				//@ 12. ЗП
				res += (vac.salary ? vac.salary : EMPTYSTR) + DIVIDER;
				//@ 13. ЗП мин
				res += (vac.salary_min ? vac.salary_min : EMPTYSTR) + DIVIDER;
				//@ 14. ЗП макс
				res += (vac.salary_max ? vac.salary_max : EMPTYSTR) + DIVIDER;
				//@ 15. Вакансии наименование
				res += (vac["job-name"] ? vac["job-name"] : EMPTYSTR) + DIVIDER;
				//@ 16. ссылка вакансии
				res += (vac.vac_url ? vac.vac_url : EMPTYSTR) + DIVIDER;
				//@ 17. Занятость
				res += (vac.employment ? vac.employment : EMPTYSTR) + DIVIDER;
				//@ 18. График
				res += (vac.schedule ? vac.schedule : EMPTYSTR) + DIVIDER;
				//@ 19. Обязанности
				res += (vac.duty ? vac.duty : EMPTYSTR) + DIVIDER;
				//@ 20. Специализация
				res += (vac.category&&vac.category.specialisation ? vac.category.specialisation : EMPTYSTR) + DIVIDER;
				//@ 21. Образование
				res += (vac.requirement&&vac.requirement.education ? vac.requirement.education : EMPTYSTR) + DIVIDER;
				//@ 22. Опыт (лет)
				res += (vac.requirement&&(typeof vac.requirement.experience != "undefined") ? vac.requirement.experience : EMPTYSTR) + DIVIDER;
				//@ 23. Адрес вакансии
				let address ="";
				const address_arr = (vac.addresses ? vac.addresses.address : "");
				if(Array.isArray(address_arr) && address_arr.length >0){
					//@
					if(address_arr.length == 1){
						const addr_test =address_arr[0].location;
						if(typeof addr_test == "string"){address =addr_test}
					}else{
						address_arr.forEach(addr_next=>{
							if(typeof addr_next.location == "string"){address += addr_next + "; "}
						})
					}
				}
				res +=address + DIVIDER;
				//@ 24. Соц-защищенный
				res += (vac.social_protected ? vac.social_protected : EMPTYSTR) + DIVIDER;
				//@ 25. Контактное лицо
				res += (vac.contact_person ? vac.contact_person : EMPTYSTR) + DIVIDER;
				//@ 26. валюта
				res += (vac.currency ? vac.currency : EMPTYSTR) + DIVIDER;
				//@ CARRIAGE RETURN
				res += EOL;
			});
			return res;
		}
	}
}

//------------TOOLS--------------------
function AScreen(width, height){
	this.dom;
	const _child_doms ={};
	this.WIDTH =width;
	this.HEIGHT =height;
	let _w =width;
	let _h =height;
	this.run=()=>{
		console.log("AScreen:", width, height);
		const mainDiv =document.createElement("div");
		this.dom =mainDiv;
		mainDiv.style.position ="absolute";
		mainDiv.style["width"] = Math.floor(_w);
		mainDiv.style["height"] = Math.floor(_h);
		//mainDiv.style["margin"] = "-8px";
		mainDiv.style["background-color"] = "#eef";
		
		document.body.appendChild(mainDiv);
		return this;
	}
	this.sizes=()=>{ return {w:_w, h:_h} }
	this.x_center=()=>{ return _w/2 }
	this.y_center=()=>{ return _h/2 }
	this.add=(id, dom)=>{
		_child_doms[id] =dom;
		this.dom.appendChild(dom);
	}
	this.drop_dom=(domRef)=>{this.dom.removeChild(domRef);}
	this.drop_by_id=(id)=>{
		console.log("AScreen.drop_by_id:", id);
		if(_child_doms[id]){
			this.dom.removeChild(_child_doms[id]);
			delete _child_doms[id];
		}
	}
	this.clear_all=()=>{
		this.dom.innerHTML ="";
	}
}

function SmartDiv(id){
	this.id =id;
	this.dom;
	let _domAnimation;
	let _last_click_time =0;
	let _click_cb=()=>{console.error("SmartDiv: click is not overrided")}
	let ws=30,hs=30,ts=5,ls=5;
	let we,he,te,le;
	this.run=(opts)=>{
		get_opts_sizes(opts);
		//console.log("SmartDiv: ws,hs,ts,ls=", ws,hs,ts,ls);
		this.dom =make_div(opts);
		if(this.id){this.dom.id =this.id;}
		_domAnimation =new Animation(this.dom);
		
		return this;
	}
	this.get_rect=()=>{return {w:ws,h:hs,t:ts,l:ls}}
	this.clear_all=()=>{this.dom.innerHTML ="";}
	this.destroy=()=>{this.dom.parentNode.removeChild(this.dom);}
	this.onclick=(callback)=>{
		if(typeof callback == "function"){
			this.dom.style.cursor ="pointer";
			_click_cb =callback;
			this.dom.onclick=(evt)=>{
				const click_time =new Date().getTime();
				//console.log("--->", click_time, _last_click_time);
				if(click_time - _last_click_time > 30){
					_last_click_time =click_time;
					_click_cb(evt);
				}
			}
		}else{
			this.dom.style.cursor ="auto";
			this.dom.onclick =null;
		}
	}
	this.append=(native_dom)=>{this.dom.appendChild(native_dom)}
	this.detach=(native_dom)=>{this.dom.removeChild(native_dom)}
	this.change_size=(steps,we,he,te,le,callback)=>{
		_domAnimation.change_size(steps,ws,hs,ts,ls,we,he,te,le,()=>{
			console.log("123");
			ws=we;hs=he;ts=te;ls=le;
			callback();
		});
	}
	this.border=(arg)=>{this.dom.style.border =arg;}
	this.outline=(arg)=>{this.dom.style.outline =arg;}
	this.change_bg=(icon)=>{
		if(typeof icon == "string" && icon.startsWith("#")){
			this.dom.style["background"] =icon;
		}else{
			this.dom.style["background-image"]= "url("+(icon?icon:"")+")";
			this.dom.style["background-repeat"]= "no-repeat";
			this.dom.style["background-position"]= "center";
			this.dom.style["background-size"]= "contain";
		}
	}
	const get_opts_sizes=(opts)=>{
		if(opts.w){ws =opts.w;}
		if(opts.h){hs =opts.h;}
		if(opts.t){ts =opts.t;}
		if(opts.l){ls =opts.l;}
	}
	const make_div=(options)=>{
		const res =document.createElement("div");
		//res.style.display = 'table-cell';
		if(options.id){res.id = options.id;}
		if(options.pos){res.style.position = options.pos;}
		else{res.style.position ="relative"}
		if(options.border){res.style.border = options.border;}
		if(options.outline){res.style.outline = options.outline;}
		if(options["text-align"]){res.style["text-align"] = options["text-align"];}
		if(options["line-height"]){res.style["line-height"] = options["line-height"];}
		//@ width, height, top, left
		if(options.w){res.style.width = options.w;}
		if(options.h){res.style.height = options.h;}
		if(options.t){res.style.top = options.t;}
		if(options.l){res.style.left = options.l;}
		if(options["z"]){res.style["z-index"] = options["z"];}
		if(options.display){res.style.display = options.display;}
		if(options.background){res.style.background = options.background;}
		if(options.overflow){res.style.overflow = options.overflow;}
		if(options.cursor){res.style.cursor = options.cursor;}
		if(options["background-image"]){res.style["background-image"] = options["background-image"];}
		if(options["background-repeat"]){res.style["background-repeat"] = options["background-repeat"];}
		if(options["background-position"]){res.style["background-position"] = options["background-position"];}
		if(options["background-size"]){res.style["background-size"] = options["background-size"];}
		return res;
	}
}

function SmartButton(name){
	let _width =100;
	let _height =40;
	let _top =0;
	let _left =0;
	let _parent_cb;
	this.smDom;
	this.run=(parDom, margins, callback)=>{
		_parent_cb =callback;
		const par_dims =parDom.get_rect();
		console.log("SmartButton:", par_dims);
		_width = (_width > par_dims.w ? par_dims.w : _width);
		_height = (_height > par_dims.h ? par_dims.h : _height);
		_top = (margins.top ? margins.top : 0);
		_left = (margins.left ? margins.left : 0) + (margins.width ? (margins.width - _width) : 0)/2;
		console.log("SmartButton:", _width, _height, _top, _left);
		this.smDom =new SmartDiv().run({
			pos: "absolute",
			w: _width,
			h: _height,
			t: _top,
			l: _left,
			background: "#ccf",
			//outline: "1px solid red"
			"line-height": _height+"px",
			"text-align": "center"
		});
		this.smDom.dom.innerHTML =name;
		this.smDom.onclick(this.button_click);
		parDom.append(this.smDom.dom);
		return this;
	}
	this.button_click=()=>{
		_parent_cb();
		console.log(1);
		this.smDom.onclick(false);
		console.log(2);
		this.smDom.change_bg("#fbb");
		console.log(3);
		this.smDom.change_size(2,_width,_height,_top+5,_left,()=>{
			this.smDom.change_bg("#ccf");
			this.smDom.change_size(1,_width,_height,_top,_left,()=>{});
		});
		console.log(4);
		setTimeout(()=>{
			console.log(5);
			this.smDom.onclick(this.button_click);
		},1000);
	}
}

function TextArea(id){
	let _ws=400,_hs=600,_ts=0,_ls=0;
	let _textArea;
	this.run=(parDom, stricts, callback)=>{
		if(stricts.top){_ts =stricts.top}
		if(stricts.left){_ls =stricts.left}
		console.log("TextArea:", _ws,_hs,_ts,_ls);
		this.smDom =new SmartDiv().run({w:_ws,h:_hs,t:_ts,l:_ls,pos: "relative"});
		parDom.append(this.smDom.dom);
		_textArea =document.createElement("textarea");
		_textArea.style.width = "100%";
		_textArea.style.height = "100%";
		this.smDom.append(_textArea);
		return this;
	}
	this.dom=()=>{return _textArea}
	this.set_val=(val)=>{
		_textArea.value =val;
	}
}

function LabeledInput(label){
	let _width =400;
	let _height =40;
	let _inputDiv;
	let _anInput;
	this.run=(parDom, margins, callback)=>{
		const par_dims =parDom.get_rect();
		_width = (_width > par_dims.w ? par_dims.w : _width);
		_height = (_height > par_dims.h ? par_dims.h : _height);
		this.smDom =new SmartDiv().run({
			pos: "absolute",
			w: _width,
			h: _height,
			t: (margins.top ? margins.top : 0),
			l: (margins.left ? margins.left : 0),
			background: "#efe"
			//outline: "1px solid black"
		});
		this.labelDiv =new SmartDiv().run({
			pos: "absolute",
			w: _width/3,
			h: _height,
			background: "#ffe",
			"text-align": "center",
			"line-height": _height+"px"
		});
		this.labelDiv.dom.innerHTML = label;
		this.smDom.append(this.labelDiv.dom);
		const input_div_left_margin =_width/3;
		_inputDiv =new SmartDiv().run({
			pos: "absolute",
			w: input_div_left_margin*2,
			h: _height,
			l: input_div_left_margin,
			background: "#eff"
		});
		this.smDom.append(_inputDiv.dom);
		parDom.append(this.smDom.dom);
		_anInput =new AnInput(label).run(_inputDiv, {}, callback);
		return this;
	}
	this.set_default=(val)=>{
		_anInput.set_default(val);
	}
	this.blink_wrong=()=>{
		this.labelDiv.dom.style.color="red";
		setTimeout(()=>{
			this.labelDiv.dom.style.color="black";
		}, 500);
	}
}

function AnInput(label){
	let _input;
	this.input_cb=()=>{console.log("AnInput("+label+") - callback not overrided");}
	this.run=(parDom, margins, callback)=>{
		const par_rect =parDom.get_rect();
		this.input_cb =callback;
		_input =document.createElement("input");
		_input.type ="text";
		_input.value = "";
		_input.style.width = par_rect.w || 200;
		_input.style.height = par_rect.h || 30;
		_input.style.top = (margins.top ? margins.top: 0);
		_input.style.left = (margins.left ? margins.left: 0);
		_input.addEventListener("input", ()=>{
			callback(_input.value)
		})
		parDom.append(_input);
		return this;
	}
	this.set_default=(val)=>{_input.value =val;}
}

function Animation(dom){
	this.id = global_animation_id+=1;
	this.dom =dom;
	this.change_bg=(args)=>{
		if(!args){
			this.dom.style["background-image"] ="";
			//this.dom.style["background-repeat"]= "no-repeat";
			//this.dom.style["background-position"]= "center";
			//this.dom.style["background-size"]= "contain";
		}
	}
	this.change_size=(steps,ws,hs,ts,ls,we,he,te,le, callback)=>{
		//console.trace("Animation.change_size: ",ws,hs,ts,ls,we,he,te,le, callback);
		let i =0;
		const STEPS =steps || 10;
		let width =ws;
		let height =hs;
		let left = ls;
		let top = ts;
		//const GRADE_W =(we > ws) ? (Math.ceil((we-ws)/STEPS)) : (-Math.ceil((we-ws)/STEPS))
		const GRADE_W =Math.ceil((we-ws)/STEPS);
		const GRADE_H =Math.ceil((he-hs)/STEPS);
		const GRADE_T =Math.ceil((te-ts)/STEPS);
		const GRADE_L =Math.ceil((le-ls)/STEPS);
		console.log("GRADES:",GRADE_W,GRADE_H,GRADE_T,GRADE_L);
		const interval =setInterval(()=>{
			i+=1;
			if(i > STEPS){
				clearInterval(interval);
				callback(null);
			}else{
				width += GRADE_W;
				height += GRADE_H;
				top += GRADE_T;
				left += GRADE_L;
				if(i == STEPS){
					width =we;
					height =he;
					top =te;
					left=le;
				}
				//console.log("Animation#"+this.id+": "+this.dom);
				this.dom.style["width"] =width;
				this.dom.style["height"] =height;
				this.dom.style["top"] =top;
				this.dom.style["left"] =left;
			}
		}, 25);
	}
}

function make_div(options){
	const res =document.createElement("div");
	//res.style.display = 'table-cell';
	if(options.position){res.style.position = options.position;}
	else{res.style.position ="relative"}
	if(options.border){res.style.border = options.border;}
	if(options.outline){res.style.outline = options.outline;}
	if(options.width){res.style.width = options.width;}
	if(options.height){res.style.height = options.height;}
	if(options.display){res.style.display = options.display;}
	if(options.background){res.style.background = options.background;}
	if(options.overflow){res.style.overflow = options.overflow;}
	if(options.top){res.style.top = options.top;}
	if(options.left){res.style.left = options.left;}
	if(options.id){res.id = options.id;}
	if(options["z-index"]){res.style["z-index"] = options["z-index"];}
	if(options.cursor){res.style.cursor = options.cursor;}
	if(options["background-image"]){res.style["background-image"] = options["background-image"];}
	if(options["background-repeat"]){res.style["background-repeat"] = options["background-repeat"];}
	if(options["background-position"]){res.style["background-position"] = options["background-position"];}
	if(options["background-size"]){res.style["background-size"] = options["background-size"];}
	return res;
}

function xml_http_request(URL, body, method, callback){
	method = method || "GET";
	let xhr = new XMLHttpRequest();
	let total_res ="";
	xhr.open(method, URL);
	//@======LISTENERS========
	xhr.onload = function() {
		//alert(`Загружено: ${xhr.status} ${xhr.response}`);
		console.log(`Загружено: ${xhr.status} ${xhr.response}`);
		callback(null, xhr.response);
	};

	xhr.onerror = function() { 
	//@ происходит, только когда запрос совсем не получилось выполнить
		const err_msg ="Ошибка соединения";
		callback(err_msg);
	};

	xhr.onprogress = function(event) { // запускается периодически
		// event.loaded - количество загруженных байт
		// event.lengthComputable = равно true, если сервер присылает заголовок Content-Length
		// event.total - количество байт всего (только если lengthComputable равно true)
		//alert(`Загружено ${event.loaded} из ${event.total}`);
		console.log(`Загружено ${event.loaded} из ${event.total}`);
	};
	//@======SEND========
	xhr.send(body);
}

//---------------------------