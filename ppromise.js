/**
 * pPromise .... 与promise/A不同
 * @description 真正的链式异步
 * @author  blueni
 */

// exp;
// var promise = pPromise();
// pPromise
// .then(function( next ){
//     console.log( 'deffer started...' );
//     next( null , 'res1...........' );  
// })
// .then(function( res1 , next ){
//     console.log( res1 );
//     next( null , 'res2...........' );
// })
// .then(function( res2 , next ){
//     console.log( res2 );
// },function( err ){
//     console.log( err );
// });

var pPromise = (function(){
    'use strict';

    var slice = Array.prototype.slice;

    function Promise(){
        this.listeners = {};
        this.length = this.index = 0;
    }

    // 异步链
    Promise.prototype.then = function( onresolved , onrejected ){
        var _this = this;
        this.listeners[this.length++] = onresolved;
        if( typeof onrejected === 'function' ){
            this.listeners[this.length - 1].errFn = onrejected;
        }
        return this;
    };

    function Deferred(){
        this.promise = new Promise();
    }

    // 走进下一个then
    Deferred.prototype.next = function( err , res ){
        var deferred = this;
        var promise = this.promise;
        var usePromise = false;
        var listener = promise.listeners[ promise.index ];
        if( !fn )return;
        if( err ){
            return fn.errFn && fn.errFn( err );
        }

        var _promise = listener( res , function( _err , _res ){
            promise.index++;
            setTimeout(function(){
                if( usePromise )return;
                if( _err ){
                    promise.index = promise.length - 1;
                }
                deferred.next( _err , _res );
            });
        });

        if( _promise && _promise.then ){
            usePromise = true;
            _promise.then(function( _res ){
                deferred.next( null , _res );
            },function( _err ){
                deferred.next( _err );
            });
        }
    }

    return function pPromise( onresolved , onrejected ){
        var deferred = new Deferred();
        setTimeout(function(){
            deferred.next();
        },0);
        return deferred.promise.then( onresolved , onrejected );
    }

})();
