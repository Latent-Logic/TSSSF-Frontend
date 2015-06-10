//After a page is updated this stores the edit key so we can modify it again
var EDIT_KEY = null;

//Loads a card
function load(kind,id){
    var o={};o[kind]=id
    $.get("dbInterface.php",o,function(r){
        var d = JSON.parse(r);
        EDIT_KEY = null;
        if (d.error){
            alert(d.error);
            return;
        }
        $(".card button").each(function(){
            $(".card").removeClass($(this).attr("value"))
        })
        $(".card").addClass(d.classes);
        $(".card .name").val(d.name);
        $(".card .attrs").val(d.attr);
        $(".card .effect").val(d.effect);
        $(".card .flavour").val(d.flavour);
        $("#image").val(d.image);
        $(".card .copyright").val(d.copyright);

        $("input[type=radio]:checked").change();
        $("#image").change();
        $(".card textarea").change();
        document.location.hash = ""

        document.location.hash = ""

        $("#shareUrl").val(document.location+"view:"+d["viewkey"]);
        if(d.editkey){
            $("#editUrl").val(document.location+"edit:"+d["editkey"]);
            document.location.hash = "edit:"+d["editkey"]
            EDIT_KEY = d["editkey"];
        } else {
            $("#editUrl").val("Cannot edit");
            document.location.hash = "view:"+d["viewkey"]
        }
    })
}

//Saves a card
function save(id){
    $.post("dbInterface.php",{
        editkey:EDIT_KEY,
        classes:$(".card").attr("class"),
        name:$(".card .name").val(),
        attr:$(".card .attrs").val(),
        effect:$(".card .effect").val(),
        flavour:$(".card .flavour").val(),
        copyright:$(".card .copyright").val(),
        image:$("#image").val()
    },function(r){
        var d = JSON.parse(r);
        if (d.error){
            alert(d.error);
            return;
        }
        document.location.hash = "."
        document.location.hash = ""
        $("#editUrl").val(document.location+"edit:"+d["editkey"]);
        $("#shareUrl").val(document.location+"view:"+d["viewkey"]);
        EDIT_KEY = d["editkey"];
        document.location.hash = "edit:"+d["editkey"]
    })
}

$(document).ready(function(){
    //On card button clicks, remove other classes and add new ones.
    //Unless it is changeling, special case, just toggle.
    $(".card button").click(function(){
        if ($(this).attr("value") == "changeling"){
            $(".card").toggleClass($(this).attr("value"));
        } else {
            $(this).parent().children("button").each(function(){
                if ($(this).attr("value") != "changeling"){
                    $(".card").removeClass($(this).attr("value"));
                }
            })
            $(".card").addClass($(this).attr("value"));
        }
    })

    //On Window resize we use css transformation to scale the card to fix
    //Yes it seems horrible but the alternative was somehting even more horrible!
    $(window).resize(function(){
        var f = ($(".cardwrapper").width())/788;
        $(".card").css("transform","scale("+f+")")
        $(".cardwrapper").height(1088*f);
    });

    //Constant infomation for special escape code handling.
    var SPECIAL_REGEX = /\\(malefemale|unicorn|pegasus|earth|alicorn|goal|time|female|male|ship)/g
    var SPECIAL_REPLACE = {
        "\\male":"\u2642",
        "\\female":"\u2640",
        "\\malefemale":"\u26A4",
        "\\ship":"\u2764",
        "\\earth":"\uE000",
        "\\unicorn":"\uE001",
        "\\pegasus":"\uE002",
        "\\alicorn":"\uE003",
        "\\time":"\uE004"
    }

    //Replace special escape codes when an input is updated
    $(".card input[type=text], .card textarea").on("change",function(){
        var txt = $(this).val();
        txt = txt.replace(SPECIAL_REGEX,function(t){
            return SPECIAL_REPLACE[t];
        });
        $(this).val(txt)
    })

    //When a text editor is updated resize it's helper to clone back the height.
    //This is because CSS Really hates working vertically
    $(".card textarea").on("change keyup paste",function(){
        var t = $(this),
            o = $(".cardHelper ." + t.attr("class"));
        o.text(t.val());
        t.height(o.height());
    });

    //Update image
    $("#image").change(function(){
        $(".card .image").css("background-image","url('"+$(this).val()+"')")
    })

    //Save button
    $("#save").click(save)

    //Inital call setup functions
    $(window).resize();
    $(".card textarea").change();

    //Check the hash to see if we are loading something
    if(document.location.hash){
        hs = document.location.hash.substr(1).split(":")
        if (hs.length==2 && (hs[0] == "view" || hs[0] == "edit")){
            load(hs[0],hs[1]);
        } else {
            document.location.hash = ""
        }
    }
});
