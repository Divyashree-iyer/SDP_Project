$(function(){
	if($('textarea#ta').length){
		CKEDITOR.replace('ta');
	}
	$('a.confirmDeletion').on('click', function(){
		if(!confirm("Confirm Deletion"))
			return false;
	});
});

$(document).ready(function(){
    var i = 1;
	var rmoveButton = 0;
	$("#add_table").click(function(){
		$("#add_table").prop("disabled",true);
		$("#table").prop('disabled',false);
		$('#dynamic_field').append('<tr><td><button id="add" type="button" class="btn btn-primary">Add field</button></td></tr>');
		
	});
	$(document).on('click', "#add", function(){
		$('#fieldNum').val(i);
		if(rmoveButton == 0){
		$('#dynamic_field').append('<tr><td><button id="rmAll" type="button" class="btn btn-danger">Remove all fields</button></td></tr>');
		rmoveButton = 1;
		}
		$('#dynamic_field').append('<tr id="row'+i+'"><td><input type="text" style="font-family: Times New Roman;" name="name" placeholder="Enter field name" class="form-control name_list"/></td><td><select id="type" name="type" class="form-control" > <option value="Text" style="font-family: Times New Roman;">Text</option><option value="Number" style="font-family: Times New Roman;">Number</option><option value="Date" style="font-family: Times New Roman;">Date</option><option value="Time" style="font-family: Times New Roman;">Time</option><option value="datetime-local" >Date & Time</option><option value="File">File</option></select></td><td><input type="radio" name="pkey" value="'+i+'" id="pkey'+i+'" class="form-check-input" /><label class="form-check-label">Primary Key</label><td><button type="button" name="remove" id="'+i+'" class="btn btn-danger btn_remove">X</button></td></tr>');  
		if($('#oldid').length==0){
			if(i==1)
			{
				$('#pkey'+i).prop("checked",true);
			}
		}
		i++;
	});
	
	
	$(document).on('click', '#rmAll', function(){ 
		for(var j=0;j<i;j++){
			$('#row'+j+'').remove(); 
		}
		 i=1;
		 $(this).parent().remove();
		 rmoveButton=0;
	}); 
	
	$(document).on('click', '.btn_remove', function(){  
      var button_id = $(this).attr("id");   
	  if(!$('#pkey'+button_id).is(':checked')){ 
		$('#row'+button_id+'').remove();  
		i--;
	  }
	else
		alert("Can't remove primary key field");
    });
	

	
  });