function action_block(device){
	Blockly.SmartThings['a_'+device] = function(block) {
		var variable_name = Blockly.SmartThings.variableDB_.getName(block.getFieldText('name'), Blockly.Variables.NAME_TYPE);
	    var dropdown_commands = block.getFieldValue('Command');
		var actionList = Blockly.SmartThings.valueToCode(block, device, Blockly.SmartThings.ORDER_ATOMIC);
		// TODO: Assemble SmartThings into code variable.
		
		var smartAction = new Action();
		if(dropdown_commands){
			if(commMap.isSingleCommad(device)){
				smartAction.devname = device+variable_name;
				smartAction.command= smartAction.devname+'.'+dropdown_commands+'()';
				smartAction.device = device;	
			}else if(commMap.isSingleMethod(device)){
				var command = commMap.getMethod(device)
				smartAction.devname = device+variable_name;
				smartAction.command= smartAction.devname+'.'+command.id+'('+dropdown_commands+')';
				smartAction.device = device;	
			}
		}else{
			smartAction.devname = device+variable_name;
			smartAction.device = device;	

		}

		if(goog.isArray(actionList))
			var result = actionList.concat(smartAction);
		else
			var result = [smartAction];
	
		return result;
	};
	
	Blockly.Blocks['a_'+device] = {
		init: function() {
			var count = deviceCount.get(device)
			if(goog.isNumber(count)){
				count = count.toString();
			}

			this.appendValueInput(device)
				.setCheck("Action")
				.appendField(device, "device")
				.appendField(new Blockly.FieldVariable(count, null, null, device), "name");
			 this.setInputsInline(false);
			var block = this.getInput(device);
			if(commMap.isSingleCommad(device)){
				block.appendField(new Blockly.FieldDropdown(commMap.getCommad_vaules(device)), "Command");
			}else if(commMap.isSingleMethod(device)){
				setMethodField(block, device);
			}else if(commMap.isMultiMethod(device)){
				block.appendField(new Blockly.FieldDropdown(commMap.getMultiType(device)), "Command_id");
				setMethodField(block, device);
			}

			this.setOutput(true, "Action");
			this.setColour(Block_colour_action);
			this.setTooltip("");
			this.setHelpUrl("");
		},
		onchange: function(event) {
			var device = this.getField("device").text_;
			var block = this.getInput(device);
			
			if(event.element == "field" && event.name ==="Command_id"){
				var id = this.getField("Command_id").text_;
				var list = commMap.getMethod_vaulesById(device, id);

				block.removeField("Command");

				if(list.length != 0)
					block.appendField(new Blockly.FieldDropdown(list), "Command");
				else
					block.appendField(new Blockly.FieldTextInput(""), "Command");

			}
			/*if(event.type == Blockly.Events.BLOCK_MOVE){

				if(this.parentBlock_ && event.newParentId == this.parentBlock_.id){
					//map - action
					block.removeField("Command");
				}
				else if(event.oldParentId){
					if(this.id == event.blockId){
						//map - action
						//disconneted
						appendComm(device, block);
					}
				}
				if(this.parentBlock_ && this.parentBlock_.type.includes("map")){
					//init action with map
					var parentBlock = this.parentBlock_
					var length = parentBlock.inputList.length-1
					var deviceList = new Set()
					
					for(var i = 0; i< length; i++){
						var block = parentBlock.getInputTargetBlock("ADD"+i)
						if(block){
							var device = block.getField("device").text_
							deviceList.add(device)
						}
					}

					var action = parentBlock.getInputTargetBlock("p")
					if(action){
						var newComm = new Set()

						for(let device of deviceList){
							if(commMap.isSingleCommad(device)){
								for(let comm of commMap.getCommad(device))
								{
									newComm.add(comm)
								}
							}
						}

						var command = []
						for(let c of newComm){
							command.push([c, c])
						}
						action.getInput("type").removeField("type")
						action.getInput("type").appendField(new Blockly.FieldDropdown(command), "type");
					}
				}
			}
*/
		}
	};
}

function appendComm(device, block){
	if(commMap.isSingleCommad(device)){
		block.appendField(new Blockly.FieldDropdown(commMap.getCommad_vaules(device)), "Command");
	}else if(commMap.isSingleMethod(device)){

	}else if(commMap.isMultiMethod(device)){
		
	}

}
function setMethodField(block, device){
		
	var method = commMap.getMethod(device);
	
	if(goog.isArray(method))
		method = method[0]

	var types = method.type;
	var values = method.value;
	
	var type = types[0];
	if(values)
		var value = values[0];
		
	if(type.toLowerCase() == "enum"){
		var list = new Array();
		for(i in value)
			list.push([value[i],value[i]]);
		block.appendField(new Blockly.FieldDropdown(list), "Command");
	}else if(type.toLowerCase() == "number"){
		block.appendField(new Blockly.FieldTextInput(""), "Command");
	}
	

}

Blockly.SmartThings['map'] = function(block) {
    var length = block.inputList.length-1
	var i = 0;
	var groupingDevice = new Grouping();
	
	groupingDevice.type = "map"

	groupingDevice.p = Blockly.SmartThings.valueToCode(block, 'p', Blockly.SmartThings.ORDER_ATOMIC);

	while(i < length){
	 	var device = Blockly.SmartThings.valueToCode(block, 'ADD'+i, Blockly.SmartThings.ORDER_ATOMIC);
	 	groupingDevice.list = groupingDevice.list.concat(device)
		i++;
	}

  return groupingDevice;
};

Blockly.Blocks['option'] = {
  init: function() {
    this.appendDummyInput("type")
        .appendField(new Blockly.FieldLabel(""), "type");
	this.setInputsInline(true);
	this.setOutput(true, "option");
    this.setColour(Block_colour_action);
	this.setTooltip("");
	this.setHelpUrl("");
  }, onchange: function(event) {
  	if(event.type == Blockly.Events.BLOCK_MOVE){
  		//this.setOutput(true, event.newValue);
  		if(!this.parentBlock_ && event.oldParentId){
			this.getInput("type").removeField("type")
			this.getInput("type").appendField(new Blockly.FieldLabel(""), "type");
  		}else if(this.parentBlock_ && event.newParentId && event.blockId == this.id){
  			if(event.newInputName == 'p'){
					this.getInput("type").removeField("type")
  			}else {
				this.getInput("type").removeField("type")
				this.getInput("type").appendField(new Blockly.FieldLabel(event.newInputName), "type");
  			}
  		}

  	}
  }
};

Blockly.Blocks['sendpush'] = {
  init: function() {
    this.appendValueInput("action")
        .setCheck("Action")
        .appendField("sendPush");
    this.appendValueInput("message")
        .setCheck("option")
        .appendField("message")
        .appendField(new Blockly.FieldTextInput(""), "text");
    this.setOutput(true, "Action");
    this.setColour(Block_colour_action);
 this.setTooltip("");
 this.setHelpUrl("");
  }, onchange: function(event){
  	if(event.newParentId == this.id)
  		if(event.newInputName == "message")
  			this.getInput("message").removeField("text");
  		
  	if(event.oldParentId == this.id)
  		if(event.oldInputName == "message")
  			this.getInput("message").appendField(new Blockly.FieldTextInput(""), "text");
  }
};

Blockly.Blocks['sendsms'] = {
  init: function() {
    this.appendValueInput("action")
		.setCheck("Action")
        .appendField("sendSms");
    this.appendValueInput("message")
		.setCheck("option")
        .appendField("message")
        .appendField(new Blockly.FieldTextInput(""), "text");
    this.appendValueInput("phone")
		.setCheck("option")
        .appendField("phone")
        .appendField(new Blockly.FieldTextInput("+82010"), "phone");
    this.setOutput(true,  "Action");
    this.setColour(Block_colour_action);
 this.setTooltip("");
 this.setHelpUrl("");
  }, onchange: function(event){
  	if(event.newParentId == this.id)
  		if(event.newInputName == "message")
  			this.getInput("message").removeField("text");
  		else if(event.newInputName == "phone")
  			this.getInput("phone").removeField("phone");
  		
  	if(event.oldParentId == this.id)
  		if(event.oldInputName == "message")
  			this.getInput("message").appendField(new Blockly.FieldTextInput(""), "text");
  		else if(event.oldInputName == "phone")
  			this.getInput("phone").appendField(new Blockly.FieldTextInput("+82010"), "phone");
  }
};

Blockly.Blocks['sendnotification'] = {
  init: function() {
    this.appendValueInput("action")
		.setCheck("Action")
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("sendNotification");
    this.appendValueInput("message")
        .setCheck("option")
        .appendField("message")
        .appendField(new Blockly.FieldTextInput(""), "text");
    this.setOutput(true, "Action");
    this.setColour(Block_colour_action);
 this.setTooltip("");
 this.setHelpUrl("");
  }, onchange: function(event){
  	if(event.newParentId == this.id)
  		if(event.newInputName == "message")
  			this.getInput("message").removeField("text");
  		
  	if(event.oldParentId == this.id)
  		if(event.oldInputName == "message")
  			this.getInput("message").appendField(new Blockly.FieldTextInput(""), "text");
  }
};

Blockly.SmartThings['sendpush'] = function(block) {
	var text_text = block.getFieldValue('text');
	var value_message = Blockly.SmartThings.valueToCode(block, 'message', Blockly.SmartThings.ORDER_ATOMIC);
	var actionList = Blockly.SmartThings.valueToCode(block, 'action', Blockly.SmartThings.ORDER_ATOMIC);
  // TODO: Assemble SmartThings into code variable.
  console.log("sendPush");

  if(text_text && !value_message){
	  var smartAction = new Action();
	  smartAction.method = 'sendPush(\"'+text_text+'\")';
  }else if(!text_text && value_message){
	  var smartAction = new Action();
	  smartAction.method = 'sendPush('+value_message.capname+')';
	  smartAction.args.push(value_message)
  }
  
	if(goog.isArray(actionList)){
		var result = actionList.concat(smartAction);
	}else{
		var result = [smartAction];

	}
  return result;
};

Blockly.SmartThings['sendsms'] = function(block) {
	var text_phone = block.getFieldValue('phone');
	var value_phone = Blockly.SmartThings.valueToCode(block, 'phone', Blockly.SmartThings.ORDER_ATOMIC);
	var text_text = block.getFieldValue('text');
	var value_message = Blockly.SmartThings.valueToCode(block, 'message', Blockly.SmartThings.ORDER_ATOMIC);
	var nextAction = Blockly.SmartThings.valueToCode(block, 'action', Blockly.SmartThings.ORDER_ATOMIC);
  // TODO: Assemble SmartThings into code variable.
  console.log("sendSms");

  var smartAction = new Action();
  smartAction.method = 'sendSms(\"'+ text_phone + '\", \"'+text_text +'\")';

  return smartAction;
};

Blockly.SmartThings['sendnotification'] = function(block) {
	var text_text = block.getFieldValue('text');
	var value_message = Blockly.SmartThings.valueToCode(block, 'message', Blockly.SmartThings.ORDER_ATOMIC);
	var actionList = Blockly.SmartThings.valueToCode(block, 'action', Blockly.SmartThings.ORDER_ATOMIC);
  // TODO: Assemble SmartThings into code variable.
   var smartAction = new Action();
  smartAction.method = 'sendNotification(\"'+text_text+'\")';

	if(goog.isArray(actionList)){
		var result = actionList.concat(smartAction);
	}else{
		var result = [smartAction];

	}
  return smartAction;
};

Blockly.SmartThings['option'] = function(block) {
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble SmartThings into code variable.

  var args = new Args();
  args.function = dropdown_type;
  args.name = dropdown_type+variable_num++;

  // TODO: Change ORDER_NONE to the correct strength.
  return args;
};