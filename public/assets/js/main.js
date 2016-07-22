$('.article-preview-item').on('click', function() {
    // Уберем все активные классы
    $('.article-preview-item').removeClass('active');
    $('.newsitem').removeClass('active');
    $(this).addClass('active');
    naid = $(this).data('article');
    $('#' + naid).addClass('active');
});

$(function() {
    $("#uploadFile").on("change", function(e)
    {
        $('#imageLoaderError').text('');
        var file = e.target.files[0];
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support
        if (/^image/.test( files[0].type) && (parseInt(files[0].size) < 1000000)){ // only image file
            var reader = new FileReader(); // instance of the FileReader
            reader.readAsDataURL(files[0]); // read the local file
            reader.onloadend = function(){ // set image data as background of div
                $("#imagePreview").css("background-image", "url("+this.result+")");
            }
        } else {
            $('#imageLoaderError').text('Файл не является изображением или загружаемое изображение слишком большое. Размер изображения не должен превышать 1мБ. Попробуйте уменьшиить изображение и загрузить снова')
        }


    });
});

/*
 $(function() {
 $("#uploadProductPreview").on("change", function(e)
 {
 var file = e.target.files[0];
 console.log('Файл ' + file)
 canvasResize(file, {
 width: 300,
 height: 0,
 crop: false,
 quality: 120,
 //rotate: 90,
 callback: function(data, width, height) {
 var files = !!this.files ? this.files : [];
 if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support
 if (/^image/.test( files[0].type)){ // only image file
 var reader = new FileReader(); // instance of the FileReader
 reader.readAsDataURL(data);
 //reader.readAsDataURL(files[0]); // read the local file
 reader.onloadend = function(){ // set image data as background of div
 $("#imageProductPreview").css("background-image", "url("+this.result+")");
 }
 }
 }
 });
 });
 }); */

$(function() {
    $("#uploadProductPreview").on("change", function(e){
        $('#imageLoaderError').text('');
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support
        if ((/^image/.test( files[0].type)) && (parseInt(files[0].size) < 1000000 )){ // only image file
            console.log(files[0]);
            var reader = new FileReader(); // instance of the FileReader
            //reader.readAsDataURL(data);
            reader.readAsDataURL(files[0]); // read the local file
            reader.onloadend = function(){ // set image data as background of div
                $("#imageProductPreview").css("background-image", "url("+this.result+")");
                file = files[0];
            }
        } else {
            $('#imageLoaderError').text('Файл не является изображением или загружаемое изображение слишком большое. Размер изображения не должен превышать 1мБ. Попробуйте уменьшиить изображение и загрузить снова');
        }
    });
});



$('#userPersonalBlocks .collapse').on('show.bs.collapse', function (e) {
    $('#userPersonalBlocks .collapse.in').collapse('hide');
    $('#userPersonalMenu li').removeClass('active');
    $($(this).data('turneron')).addClass('active');
})

var workshopAdressInputChanged = false;
$("#workshopAdressInput").on('input', function(){
    if (!workshopAdressInputChanged){
        $("#workshopAdressInput").suggestions({
            serviceUrl: "https://dadata.ru/api/v2",
            token: "eaf6e3e9b49f477dc59fae5095827725853dd855",
            type: "ADDRESS",
            /* Вызывается, когда пользователь выбирает одну из подсказок */
            onSelect: function(suggestion) {
                console.log(suggestion);
            }
        });
        workshopAdressInputChanged= true;
    }
})


$('.editProductButton').on('click', function(){
    link = $(this).data('link');
    window.location.assign(link);
});

$('.removeProductButton').on('click', function() {
    // data-identirier=product._id, data-productImage=product.previewImg, data-productName=product.name
    $('#removeProductImage').attr('src', $(this).data('productimage'));
    $('#removeProductName').text($(this).data('productname'));
    $('#removeProductIdentifier').val($(this).data('identirier'));
});

$('#cancelRemoveProduct').on('click', function() {
    $('#removeProductModal').modal('hide');
    return false;
})

$('.priceplanlistitem').on('click', function(){

    // Если нет запрещающего стиля
    if (!$(this).hasClass("disabledPricePlan")) {
        // Меняем стиль
        $('.priceplanlistitem').removeClass('chosenPricePlan');
        $(this).addClass('chosenPricePlan');

        $('#changePricePlanIdInput').val($(this).data('changeid'));
    }

});
$('.removeFavButton').on('click', function() {
    var btn = $(this);
    $.ajax({
                type: 'POST',
                url: "/addfavourite",
                data: {operation: "delete", product: btn.data('identirier'), user: btn.data('ofuser')},
                success: function() {
                    btn.parent().parent().fadeOut();
                    $('.alert-favoutite').show()
                    setTimeout(function() {
                        $('.alert-favoutite').hide()
                    }, 2000)
                }
            }); 
    })
$('.removeCartButton').on('click', function() {
    var btn = $(this);
    $.ajax({
                type: 'POST',
                url: "/cart",
                data: {operation: "delete", product: btn.data('identirier')},
                success: function() {
                    btn.parent().parent().fadeOut();
                    $('.alert-favoutite').show()
                    setTimeout(function() {
                        $('.alert-favoutite').hide()
                    }, 2000)
                }
            }); 
    })
var socket = io();
$('#sendMessageForm').on('submit', function() {
    var user1 = $('#user1Id').val();
    var user1Name = $('#user1Name').val();
    var user2 = $('#user2Id').val();
    var messagebody = $('#messageBody').val();
    socket.emit('message', messagebody);
    $.ajax({
        type: 'POST',
        url: "/messages",
        data: {user1: user1, user2: user2, user1Name: user1Name, messagebody: messagebody, from: user1},
        success: function() {
            console.log('Message Sent!');
            $('#sendMessage').modal('hide');
        }
    });
    return false;
});
socket.on('message', function(msg){
        //alert(msg)
        $('#'+msg.id).find('.subs-main').append('<div class="submessage"><p>'+ msg.msg +'</p></div>')
      });
$('.respondOnMessage').on('submit', function() {
    var form = $(this);
    var user1 = $(this).find('.user1Id').val();
    var user2 = $(this).find('.user2Id').val();
    var messagebody = $(this).find('.messageBody').val();
    socket.emit('message', {msg: messagebody, id: form.parent().parent().attr('id')});
    if (messagebody.length > 0) {
        $.ajax({
            type: 'POST',
            url: "/messages",
            data: {user1: user1, user2: user2, messagebody: messagebody, from: user2},
            success: function() {
                form.parent().find('.subs-main').append('<div class="submessage pull-right"><p>'+ messagebody +'</p></div>')
                form.find('.messageBody').val('');
            }
        });
    }
    return false;
})
$('.message-header').on('click', function() {
    $(this).parent().find('.subs').toggle( "fast" );
});
var products = [];
$('.btnCartConfirm').on('click', function() {
    $('.productsincart').find('.col-md-3').each(function(order, element) {
        var name = $(this).find('.tovarname').text();
        var image = $(this).find('img').attr('src');
        var id  = $(this).attr('id');
        products.push({name: name, image: image, id: id});
    })
    console.log(products);
})
$('#orderCartModal').on('shown.bs.modal', function () {
var modal = $(this);
    if(modal.find('.row').find('.products').is(':empty')) {
      $(products).each(function() {

          modal.find('.row').find('.products').append('<div class="col-md-6 col-sm-6 col-xs-6 col-lg-6"><img src="'+this.image+'" style="width:100%;"><p><strong>'+this.name+'</strong></p></div>')   

      });
      }
})
$('#multiOrder').on('submit', function() {
    var userid = $("input[name='userid']").val();
    var comment = $("textarea[name='comment']").val();
    $(products).each(function() {
        $.ajax({
            type: 'POST',
            url: "/add-order-existing-user",
            data: {productid: this.id, userid: userid, comment: comment},
            success: function() {
                $('#orderCartModal').modal('hide');
                window.location.href = "/"
            }
        });
    });
    return false;
});
$('.clearCart').on('click', function() {
    $.ajax({
                type: 'POST',
                url: "/cart",
                data: {operation: "clear"},
                success: function() {
                    window.location.href = '/cart'
                }
            }); 
})
$('#multiOrderNewUser').on('submit', function() {
    var email = $(this).find('#emailInput').val();
    var password = $(this).find('#passwordInput').val();
    var firstName = $(this).find('#firstNameInput').val();
    var secondName = $(this).find('#secondNameInput').val();
    var phone = $(this).find("input[name='phoneInput']").val();
    var comment = $("textarea[name='comment']").val();
    var userid;
    $.ajax({
        type: 'POST',
        url: "/add-order-new-user",
        data: {emailInput: email, passwordInput: password, firstNameInput: firstName, secondNameInput: secondName, phoneInput: phone, productid: products[0].id, comment: comment},
        success: function(data) {
            //$('#orderCartModal').modal('hide');
            userid = data.userid._id;
            console.log(userid);
            
            console.log(products);
            products.splice(0,0);
            $(products).each(function() {
                console.log(this.id)
                $.ajax({
                    type: 'POST',
                    url: "/add-order-existing-user",
                    data: {productid: this.id, userid: userid, comment: comment},
                    success: function() {
                        $('#orderCartModal').modal('hide');
                        window.location.href = "/"
                    }
                });
            });
        }
    });
    
    return false;
})
$(document).on('ready', function() {
    $('img').on('error', function() {
        var broken = $(this).attr('src');
        console.log(broken);
        if (broken[0] == "/") {
            $(this).attr('src', "/assets/images/tovar.png");
            /*
            $.ajax({
                    type: 'GET',
                    url: "/sync",
                    data: {img: "http://lavka.club"+broken, path: broken},
                    success: function() {
                        console.log(data);
                    }
            });
            */
        } else {
            $(this).attr('src', "/assets/images/tovar.png");
        }
        $(this).on('error', function() {
            $(this).attr('src', "/assets/images/tovar.png");
        });
        $(this).unbind( "error" );
    });
});
<!-- BEGIN JIVOSITE CODE {literal} -->
(function(){ var widget_id = 'rRz3doCkIE';
    var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = '//code.jivosite.com/script/widget/'+widget_id; var ss = document.getElementsByTagName('script')[0]; ss.parentNode.insertBefore(s, ss);})();
<!-- {/literal} END JIVOSITE CODE -->

<!-- Yandex.Metrika counter -->
(function (d, w, c) {
    (w[c] = w[c] || []).push(function() {
        try {
            w.yaCounter26527896 = new Ya.Metrika({id:26527896,
                webvisor:true,
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true});
        } catch(e) { }
    });
    var n = d.getElementsByTagName("script")[0],
        s = d.createElement("script"),
        f = function () { n.parentNode.insertBefore(s, n); };
    s.type = "text/javascript";
    s.async = true;
    s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js";
    if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
    } else { f(); }
})(document, window, "yandex_metrika_callbacks");
<!-- /Yandex.Metrika counter -->



(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-48145825-2', 'auto');
ga('send', 'pageview');


/*
 $('#addToSuperListButton').on('click', function(){
 var data={productid: $(this).data('product'), service:'super'};
 $.ajax({
 url: '/apply-service-product',
 data: data,
 cache: false,
 contentType: 'multipart/form-data',
 processData: false,
 type: 'POST',
 success: function(data){
 alert(data);
 //window.location.assign('/workshop-private');
 }
 });
 });

 $('#addToBestListButton').on('click', function(){
 var data={productid: $(this).data('product'), service:'best'};
 $.ajax({
 url: '/apply-service-product',
 data: data,
 cache: false,
 contentType: 'multipart/form-data',
 processData: false,
 type: 'POST',
 success: function(data){
 alert(data);
 //window.location.assign('/workshop-private');
 }
 });
 });

 $('#highlightProductButton').on('click', function(){
 var data={productid: $(this).data('product'), service:'highlight'};
 $.ajax({
 url: '/apply-service-product',
 data: data,
 cache: false,
 dataType: "json",
 contentType: 'multipart/form-data',
 processData: false,
 type: 'POST',
 success: function(data){
 alert(data);
 //window.location.assign('/workshop-private');
 }
 });
 }); */

