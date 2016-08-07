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
});
$('input[name="method"]').on('change', function() {
    console.log('WHOO');
    if ($(this).val() == "album") {
        //$('#albumid').show();
        var groupid = $('#groupid').val();
        $.ajax({
                        type: 'GET',
                        url: "/import-getalbums?groupid="+groupid,
                        data: {},
                        success: function(data) {
                            console.log(data);
                            $('.albums').html('<p style="margin-left:15px;">Выберите альбом</p>');
                            var albums = data.response.items;
                            $(albums).each(function() {
                                $('.albums').append('<div id="'+this.id+'" class="album-card"><div class="album-cover" style="background-image:url(\''+this.thumb_src+'\');background-size:cover;"></div><p class="title">'+this.description+'</p></div>')
                            });
                            $('.album-card').on('click', function() {
                                console.log('Album choosen');
                                var albumid = $(this).attr('id');
                                console.log(albumid);
                                $.ajax({
                                                type: 'GET',
                                                url: "/import-vkalbum?groupid="+groupid+"&albumid="+albumid,
                                                data: {groupid:groupid},
                                                success: function(data) {
                                                    var vkresponse = JSON.parse(data);
                                                    console.log(vkresponse);
                                                    var vkphotos = vkresponse.response.items;
                                                    console.log(vkphotos);

                                                    $('.albums').fadeOut();
                                                    $('.photos').html('');
                                                    $('.photos').fadeIn();
                                                    $('.controls').fadeIn();
                                                    $('.back').show();
                                                    $(vkphotos).each(function() {
                                                        $('.photos').append('<div class="photo-card"><div class="photo-controls"><div class="check"><i class="fa fa-check" aria-hidden="true"></i></div></div><div class="photo-cover" style="background-image:url(\''+this.photo_604+'\');background-size:cover;"></div><p class="title">'+this.text+'</p><input type="text" class="form-control price" placeholder="Введите цену" /><input class="bigimg" type="hidden" value="'+this.photo_604+'"/><input type="hidden" class="thumbsrc" value="'+this.photo_130+'"/><input class="impdescription" type="hidden" value=" "/></div>')
                                                    });
                                                    $('.photo-card .check').on('click', function() {
                                                        if ($(this).hasClass('checked')) {
                                                            $(this).removeClass('checked');
                                                            $(this).parent().parent().removeClass('todb');
                                                        } else {
                                                            $(this).addClass('checked');
                                                            $(this).parent().parent().addClass('todb');
                                                        }
                                                    })
                                                }
                                });
                            });
                            $('.back').on('click', function() {
                                $('.photos').fadeOut();
                                $('.albums').fadeIn();
                                $('.back').hide();
                            })
                        }
        });
    } else {
        //$('#albumid').hide();
        var groupid = $('#groupid').val();
        $.ajax({
                        type: 'GET',
                        url: "/import-vkmarket?groupid="+groupid,
                        data: {groupid:groupid},
                        success: function(data) {
                            var vkresponse = JSON.parse(data);
                            console.log(vkresponse);
                            var vkproducts = vkresponse.response.items;
                            console.log(vkproducts);
                            $('.albums').fadeOut();
                            $('.photos').html('');
                            $('.photos').fadeIn();
                            $(vkproducts).each(function() {
                                $('.photos').append('<div class="photo-card"><div class="photo-controls"><div class="check"><i class="fa fa-check" aria-hidden="true"></i></div></div><div class="photo-cover" style="background-image:url(\''+this.photos[0].photo_604+'\');background-size:cover;"></div><p class="title">'+this.title+'</p><input type="text" class="form-control price" value="'+parseInt(this.price.amount)/100+'" placeholder="Введите цену" /><input class="bigimg" type="hidden" value="'+this.photos[0].photo_604+'"/><input type="hidden" class="thumbsrc" value="'+this.thumb_photo+'"/><input class="impdescription" type="hidden" value="'+this.description+'"/></div>')
                            });
                            $('.photo-card .check').on('click', function() {
                                                        if ($(this).hasClass('checked')) {
                                                            $(this).removeClass('checked');
                                                            $(this).parent().parent().removeClass('todb');
                                                        } else {
                                                            $(this).addClass('checked');
                                                            $(this).parent().parent().addClass('todb');
                                                        }
                                                    })
                        }
        });
    }
});

$('.btn-step-two').on('click', function() {
    var grouplink = $('#grouplink').val();
    console.log(grouplink);
    var vkidentifier = grouplink.split('/');
    console.log(vkidentifier);
    $(vkidentifier).each(function() {
        if (this != 'https:' && this != '' && this != 'new.vk.com' && this != 'vk.com') {
            vkidentifier = this;
        }
    });
    console.log(vkidentifier.toString());
    var method = 'getgroupid';
    
    $.ajax({
                        type: 'GET',
                        url: "/import-getgroupid?grouplink="+vkidentifier.toString(),
                        data: {},
                        success: function(data) {
                            console.log(data);
                            var gid = data.response[0].gid;
                            console.log(gid);
                            $('#groupid').val(gid);
                            $('.step-two').toggle();
                        }
        });
});
/*
$('#importVk').on('click', function() {
    var groupid = $('#groupid').val();
    console.log(groupid);
    var method = $('input[name="method"]:checked').val();
    if (method == "market") {
        $.ajax({
                        type: 'GET',
                        url: "/import-vkmarket?groupid="+groupid,
                        data: {groupid:groupid},
                        success: function(data) {
                            var vkresponse = JSON.parse(data);
                            console.log(vkresponse);
                            var vkproducts = vkresponse.response.items;
                            console.log(vkproducts);
                            $('.imported').html('');
                            $(vkproducts).each(function() {
                                $('.imported').append('<div class="col-xs-4" style="min-height:350px;"><img class="img-responsive" src="'+this.thumb_photo+'" alt="" /><p class="title">'+this.title+'</p><input type="text" class="form-control price" value="'+parseInt(this.price.amount)/100+'" placeholder="Введите цену" /><input class="bigimg" type="hidden" value="'+this.photos[0].photo_604+'"/><input class="impdescription" type="hidden" value=" "/></div>')
                            });
                        }
        });
    }
    if (method == "album") {
        var albumid = $('#albumid').val();
        $.ajax({
                        type: 'GET',
                        url: "/import-vkalbum?groupid="+groupid+"&albumid="+albumid,
                        data: {groupid:groupid},
                        success: function(data) {
                            var vkresponse = JSON.parse(data);
                            console.log(vkresponse);
                            var vkphotos = vkresponse.response.items;
                            console.log(vkphotos);
                            $('.imported').html('');
                            $(vkphotos).each(function() {
                                $('.imported').append('<div class="col-xs-4" style="min-height:350px;"><img class="img-responsive" src="'+this.photo_130+'" alt="" /><p class="title">'+this.text+'</p><input type="text" class="form-control price" placeholder="Введите цену" /><input class="bigimg" type="hidden" value="'+this.photo_604+'"/><input class="impdescription" type="hidden" value=" "/></div>')
                            });
                        }
        });
    }
});
*/
$('#importOk').on('click', function() {
    var groupid = $('#okgroupid').val();
    console.log(groupid);
    var albumid = $('#okalbumid').val();
    $.ajax({
                        type: 'GET',
                        url: "/import-okalbum?groupid="+groupid+"&albumid="+albumid,
                        data: {groupid:groupid},
                        success: function(data) {
                            var okresponse = data;
                            console.log(okresponse);
                            var okphotos = okresponse.photos;
                            $('.imported').html('');
                            
                            $(okphotos).each(function() {
                                $('.photos').append('<div class="photo-card"><div class="photo-controls"><div class="check"><i class="fa fa-check" aria-hidden="true"></i></div></div><div class="photo-cover" style="background-image:url(\''+this.pic640x480+'\');background-size:cover;"></div><p class="title">'+this.text+'</p><input type="text" class="form-control price" placeholder="Введите цену" /><input class="bigimg" type="hidden" value="'+this.pic640x480+'"/><input type="hidden" class="thumbsrc" value="'+this.pic128x128+'"/><input class="impdescription" type="hidden" value=" "/></div>')
                            });
                            $('.photo-card .check').on('click', function() {
                                                        if ($(this).hasClass('checked')) {
                                                            $(this).removeClass('checked');
                                                            $(this).parent().parent().removeClass('todb');
                                                        } else {
                                                            $(this).addClass('checked');
                                                            $(this).parent().parent().addClass('todb');
                                                        }
                                                    })
                            
                        }
    });
});
$('.alltodb').on('click', function() {
    var toImport = [];
    if ($(this).parent().parent().find('.importerCat').val() == null) {
        console.log('Wrong Category')
        $('.importerCat').css('border', '2px solid red');
        //return false;
    }
    $(this).parent().parent().find('.photos .photo-card').each(function() {
        if ($(this).hasClass('todb')) {
            var title = $(this).find('.title').text();
            var previewImg = $(this).find('.thumbsrc').val();
            var price = $(this).find('.price').val();
            var worksopId = $('#workId').val();
            var userId = $('#workUser').val();
            var category = $(this).parent().parent().find('.importerCat').val();
            var description = $(this).find('.impdescription').val();
            var productimage = $(this).find('.bigimg').val();
            var importer = {
                title: title,
                previewImg: previewImg,
                productimage: productimage,
                price: price,
                user: userId,
                workshop: worksopId,
                category: category,
                description: description
            }
            toImport.push(importer);
        }
    })
    console.log(toImport);
    $.ajax({
                    type: 'POST',
                    url: "/import",
                    data: {importers:JSON.stringify(toImport)},
                    success: function(data) {
                        console.log(data);
                        location.reload();
                    }
    });
});
$(document).on('ready', function() {
    $('img').on('error', function() {
        var broken = $(this).attr('src');
        console.log(broken);
        $(this).attr('src', "http://lavka.club"+broken);
        /*
        if (broken[0] == "/") {
            $(this).attr('src', "http://lavka.club"+broken);
            /*
            $.ajax({
                    type: 'GET',
                    url: "/sync",
                    data: {img: "http://lavka.club"+broken, path: broken},
                    success: function() {
                        console.log(data);
                    }
            });
            
        } else {
            $(this).attr('src', "http://lavka.club"+broken);
        }
        $(this).on('error', function() {
            $(this).attr('src', "http://lavka.club"+broken);
        });
        */
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

