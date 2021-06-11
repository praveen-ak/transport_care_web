const locutus = require('locutus/php/strings/strtr');
module.exports = function strtr (str, trFrom, trTo) 
{

    var krsort = require('locutus/php/array/ksort')
    var iniSet = require('locutus/php/info/ini_set')
    
    var fr = ''
    var i = 0
    var j = 0
    var lenStr = 0
    var lenFrom = 0
    var sortByReference = false
    var fromTypeStr = ''
    var toTypeStr = ''
    var istr = ''
    var tmpFrom = []
    var tmpTo = []
    var ret = ''
    var match = false
    
    // Received replace_pairs?
    // Convert to normal trFrom->trTo chars
    if (typeof trFrom === 'object') {
    // Not thread-safe; temporarily set to true
    // @todo: Don't rely on ini here, use internal krsort instead
    sortByReference = iniSet('locutus.sortByReference', false)
    trFrom = krsort(trFrom)
    iniSet('locutus.sortByReference', sortByReference)
    
    for (fr in trFrom) {
        if (trFrom.hasOwnProperty(fr)) {
            tmpFrom.push(fr)
            tmpTo.push(trFrom[fr])
        }
    }
    
    trFrom = tmpFrom
    trTo = tmpTo
    }
    
    // Walk through subject and replace chars when needed
    lenStr = str.length
    lenFrom = trFrom.length
    fromTypeStr = typeof trFrom === 'string'
    toTypeStr = typeof trTo === 'string'
    
    for (i = 0; i < lenStr; i++) {
        match = false
        if (fromTypeStr) {
            istr = str.charAt(i)
            for (j = 0; j < lenFrom; j++) {
                if (istr === trFrom.charAt(j)) {
                    match = true
                    break
                }
            }
        } else {
            for (j = 0; j < lenFrom; j++) {
                if (str.substr(i, trFrom[j].length) === trFrom[j]) {
                    match = true
    // Fast forward
    i = (i + trFrom[j].length) - 1
    break
    }
    }
    }
    if (match) {
        ret += toTypeStr ? trTo.charAt(j) : trTo[j]
    } else {
        ret += str.charAt(i)
    }
    }
    
    return ret
}