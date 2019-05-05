require("./angular-1/angular-app-website");

setTimeout(() => {
    $('.nano').nanoScroller({
        iOSNativeScrolling: true 
    });
    
    $('.nano.nano-scrolldown').nanoScroller({
        iOSNativeScrolling: true,
        scroll: 'bottom' 
    });
}, 500);

function validateElement(element){

    var nameReg = /^[^0-9]+$/;
    var numberReg = /^(?:\+?)[0-9]+$/;
    var emailReg = /^\S+@\S+$/;


    var names_field;
    var email_field;
    var message_field;
    var telephone_field;

    var names = '';
    var email = '';
    var message = '';
    var telephone = '';

    var error_field = 0;

    var form = element.closest('form');
    var inputMessage = {
        'name':"Vul uw naam in.",
        'email':"Vul uw email adres in.",
        'message': "Vul een bericht in.",
        'phone': "Alleen nummers toegestaan"
    };

    $(element).closest('.form-group').removeClass('has-error').find('.help-block').html('');

    if($(element).attr('name') == 'name'){
        names_field = $(element);
        names = $(element).val();

        if(names == "" || !nameReg.test(names)){
            $(names_field).closest('.form-group').find('.help-block').html("").html(inputMessage['name']);
            $(names_field).closest('.form-group').addClass('has-error');
        }
    }
    else if($(element).attr('name') == 'email'){
        email_field = $(element);
        email = $(element).val();

        if(email == "" || !emailReg.test(email)){
            $(email_field).closest('.form-group').find('.help-block').html("").html(inputMessage['email']);
            $(email_field).closest('.form-group').addClass('has-error');
        }
    }
    else if($(element).attr('name') == 'message'){
        message_field = $(element);
        message = $(element).val();

        if(message == ""){
            $(message_field).closest('.form-group').find('.help-block').html("").html(inputMessage['message']);
            $(message_field).closest('.form-group').addClass('has-error');
        }
    }
    else if($(element).attr('name') == 'phone'){
        telephone_field = $(element);
        telephone = $(element).val();

        if($(telephone_field).length > 0 && telephone !='' && !numberReg.test(telephone)){
            $(telephone_field).closest('.form-group').find('.help-block').html("").html(inputMessage['phone']);
            $(telephone_field).closest('.form-group').addClass('has-error');
        }
    }


    $(form).find('.form-control').each(function (i, el) {
        if($(el).closest('.form-group').hasClass('has-error') || $(el).closest('.required').find('.form-control').val() == ''){
            error_field += 1;
        }
    });

    if(error_field > 0){
        $(form).find('button').prop('disabled','disabled');
    }
    else{
        $(form).find('button').removeAttr("disabled");
    }
}

$('.btn_link').on('click', function(e) {

    e.preventDefault();

    var video = $(this).closest('.tab-pane').find('.wrapper_tab_video video');

    $(this).toggleClass('active');

    if($(this).hasClass('active')){
        $(video)[0].play();
    } else {
        $(video)[0].pause();
    }
});

$('.wrapper_tab_video video').hover(function toggleControls() {
    if (this.hasAttribute("controls")) {
        this.removeAttribute("controls")
    } else {
        this.setAttribute("controls", "controls")
    }
});

$(document).ready(function(){

    $( 'a[data-toggle="tab"]' ).on('shown.bs.tab', function(e) {

        e.preventDefault();

        var target = $(e.target).attr("href");
        var tab_block;
        var video;

        $('.wrapper_tab_video').each(function (i, el) {
            var video = $(el).find('video');
            var play_btn = $(el).closest('.tab-pane').find('.btn_link');

            $(play_btn).removeClass('active');

            $(video)[0].pause();
        });
        $( 'a[data-toggle="tab"]' ).each(function (i, el) {
            var btn = $(el).find('.btn_link');

            $(btn).removeClass('active');
        });

        if (target == '#panel1') {
            tab_block=$('#panel1');
        } else if (target == '#panel2'){
            tab_block=$('#panel2');
        } else if (target == '#panel3'){
            tab_block=$('#panel3');
        } else if (target == '#panel4'){
            tab_block=$('#panel4');
        }

        video = $(tab_block).find('.wrapper_tab_video video');

        $(this).find('.btn_link').toggleClass('active');

        $(video)[0].currentTime = 0;
        $(video)[0].play();
    });

    $('form#formContact .form-group .form-control, form#formContactHome .form-group .form-control').on('change',function(){
        validateElement($(this));
    }).on('keyup', function (e) {
        validateElement($(this));
    });

    $('form#formContact .form-group input.form-control, form#formContactHome .form-group input.form-control').on('keypress', function (e) {
        if(e.which === 13){
            validateElement($(this));
        }
    });

    $('.clear_field').on('click', function (e) {
        e.preventDefault();

        $(this).closest('.form-group').find('.form-control').val('');

        validateElement($(this).closest('.form-group').find('.form-control'));
    });
});

$('.site_footer .nav_category .title').on('click', function () {
   $(this).toggleClass('open')
});

$("#modalContact").on('show.bs.modal', function (e) {
    $('body > .wrapper, body > header, body > footer').each(function (i, el) {
        $(el).addClass('blur');
    });
    $('#formSubmit').prop('disabled','disabled');
});

$("#modalContact").on('hidden.bs.modal', function (e) {
    $('body > .wrapper, body > header, body > footer').each(function (i, el) {
        $(el).removeClass('blur');
    });
});

$(window).on('load', function () {
    $('#formSubmitHome').prop('disabled','disabled');
});