let ContactComponent = function() {

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
    $(document).ready(function(){
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
    });
};

module.exports = {
    controller: [
        ContactComponent
    ],
    templateUrl: 'assets/tpl/pages/website/contact.html'
};