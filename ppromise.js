/**
 * pPromise .... 与promise/A不同
 * @description 真正的链式异步
 * @author  blueni
 */

var pPromise = (function(){
    'use strict';

    function Promise(){
        this.resolveListeners = [];
        this.rejectListeners = [];
        this.onerror = null;
        this.length = this.index = 0;
    }

    // 异步链
    Promise.prototype.then = function( onresolved , onrejected ){
        this.resolveListeners[this.length] = onresolved;
        this.rejectListeners[this.length] = onrejected;
        this.length++;
        return this;
    };

    // 捕获异常
    Promise.prototype.catch = function( onerror ){
        this.onerror = onerror;
        return this;
    }

    function Deferred(){
        this.promise = new Promise();
    }

    // 走进下一个then
    Deferred.prototype.next = function( err , res ){
        var deferred = this;
        var promise = this.promise;

        // 后续没有then了
        if( promise.index > promise.length - 1 )return;

        var usePromiseStead = false;
        var onresolved = promise.resolveListeners[ promise.index ];
        var onrejected = promise.rejectListeners[ promise.index ];

        // 报错,执行onerror方法&跳出异步链
        if( err ){
            onrejected && onrejected( err );
            promise.onerror( err );    
            return;
        }

        // 本次then并没有传入onresolved监听器,使用下一个onresolved
        if( !onresolved ){
            promise.index++;
            deferred.next( err , res );
            return;
        }   

        // onresolved方法传入上一次的返回结果&执行下一轮的匿名方法(next)
        var _promise = onresolved( res , function( _err , _res ){
            setTimeout(function(){
                // 如果onresolved方法返回了promise,next再用也不起效果了
                if( usePromiseStead )return;

                // 到下一个then去
                promise.index++;
                deferred.next( _err , _res );
            });
        });

        // onresolved返回了一个promise,使用promise的返回值
        if( _promise && _promise.then ){
            promise.index++;
            usePromiseStead = true;
            _promise.then(function( _res ){
                deferred.next( null , _res );
            },function( _err ){
                deferred.next( _err );
            });
        }
    }

    return function pPromise( onresolved , onrejected ){
        var deferred = new Deferred();

        // 在写完了所有的then之后再来执行异步链
        setTimeout(function(){
            deferred.next();
        },0);

        // pPromise方法就可以直接当成then方法使用
        if( typeof onresolved === 'function' ){
            return deferred.promise.then( onresolved , onrejected );
        }

        // 返回promise好继续调用then方法
        return deferred.promise;
    }

})();
