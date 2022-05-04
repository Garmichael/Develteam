let ioReference;

module.exports = {
    setIoInstance: function(io){
        console.log('Socket.io Instance Set');
        ioReference = io;
    },

    getIoInstance: function(){
        return ioReference;
    }
};