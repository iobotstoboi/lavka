//Отправка данных аяксом
function SendData(url, data, callback) {
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: callback
    });            
}

//Функция создания контекстного меню
function CreateContext(event, target) {
    target.addClass('selected-html-element');
    $('<div/>', {
        class: 'context-menu'
    }).css({
        left: event.pageX + 'px',
        top: event.pageY + 'px'
    }).appendTo('body').append($('<ul/>').append('<li class="context-item"><a href="#" data-toggle="modal" data-target="#CategoryModal" class="context-item">Добавить категорию</a></li>').append('<li class="context-item" ><a href="#" class="context-item" data-toggle="modal" data-target="#ConfirmDeleteModal" >Удалить категорию</a></li>')).show('fast');
}

$(document).ready(function() {
    console.log('JS Loaded!');
    
    document.oncontextmenu = function() {
        return false;
    };

    //Удаление категории
    $('#formDelete').on('submit', function() {
        var catId = $('.selected-html-element').attr('id');
        console.log(catId)
        SendData("/manager", {
                operation: "deletecat",
                catId: catId
            }, function() {
              console.log('Category Deleted');  
              location.reload();
            });
        return false;
    });

    //Создание контекстного меню
    $('.categories').mousedown(function(event) {
        $('*').removeClass('selected-html-element');
        $('.context-menu').remove();
        if (event.which === 3) {
            var target = $(event.target);
            console.log(target);
            CreateContext(event, target);
        }
    });

    //События при откытии модальных окон
    $('#CategoryModal').on('shown.bs.modal', function() {
        $('.context-menu').remove();
        var parentCat = $('.selected-html-element').attr('id');
        if (parentCat) {
            $('#catparent').val(parentCat);
        } else {
            $('#catparent').val('/');
        }
    });
    $('#ConfirmDeleteModal').on('shown.bs.modal', function() {
        $('.context-menu').remove();
    });

    //Создание категории
    $('#formAdd').on('submit', function() {
        SendData("/manager", {
                operation: "createcat",
                catname: $('#catname').val(),
                catfullname: $('#fullcatname').val(),
                catdescription: $('#catdescription').val(),
                caturl: $('#caturl').val(),
                catalias: $('#catalias').val(),
                catparent:$('#catparent').val()
            }, function() {
                console.log('Category Created');
                location.reload();
        });
        return false;
    });

    //Автозаполнение поля с url по псевдониму
    $('#catalias').on('keyup', function() {
        var nowalias = $(this).val();
        $('#caturl').val('/catalog/' + nowalias);
    });
    $('.products-treeview').each(function(index, elem) {
        var catId = $(elem).attr('id');
        SendData("/manager", {
                operation: "getproductsbycat",
                catId: catId
            }, function(data) {
              //console.log('Products are here!');
              //console.log(data.products);
              var products = data.products;
              $(elem).children('.label').text(products.length);
              if (window.location.pathname == "/manager/orders") {
                $('.order-item').each(function(index, elem) {
                    var nowId = $(this).find("#productId").text();
                    $(products).each(function(prodindex, prod) {
                        if (prod._id == nowId) {
                            $(elem).find("#productId").text(prod.name);
                            $(elem).find(".small-order").attr('src', prod.previewImg);
                            $(elem).find(".small-order").attr('onError', "this.onerror=null;this.src='/assets/images/tovar.png';")
                        }
                    })
                })
              }
        });
        //$(elem).children('.label').text('10');
    });
    /*
    Получение товаров подкатегории 
    $('.products-treeview').on('click', function() {
        var catId = $(this).attr('id');
        var thisCat = $(this);
        console.log('Load products');
        console.log(catId);
        SendData("/manager", {
                operation: "getproductsbycat",
                catId: catId
            }, function(data) {
              console.log('Products are here!');
              console.log(data.products);
              var products = data.products;
              for (var i = products.length - 1; i >= 0; i--) {
                  thisCat.next("ul").addClass('closest');
                  thisCat.next("ul").append('<li><a href="#" style="white-space:normal;">' + products[i].name + '</a></li>')
              }
        });
    });
    */
    $('.delete').on('click', function() {
        var card = $(this).parent();
        var productId = $(this).data("productid");
        console.log(productId);
        $('.alerts').html('<div class="alert alert-danger "><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Вы действительно хотите удалить элемент? <a class="btn btn-danger" id="delete-confirm">Удалить</a></div>');
        $('#delete-confirm').on('click', function() {
            // $.post( "/manager/super", { productId: productId, oper: "delete" })
            SendData("/manager/service", {
                type: "super",
                productId: productId,
                oper: "delete"
            }, function() {
                card.fadeOut();
                $('.alert-danger').alert('close')
            });
        });
    });
    $('#formAddService').on('submit', function() {
        var formData = $(this).serializeArray();
        var productId = formData[0].value
        var type = formData[1].value
        var enddate = formData[2].value
        console.log(formData);
        SendData("/manager/service", {
                productId: productId,
                type: type,
                enddate: enddate,
                oper: "addnew"
            }, function() {
                window.location = "/manager/service/"+type;
            });
        return false;
    });
});