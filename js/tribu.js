function displayTribuMembers(){
	Helpers.withPrismic(function(ctx) {
		var request = ctx.api.form("everything").ref(ctx.ref);

        var query = '[[:d = at(document.type, "formateur")]]'
        request.query(query);

        request.set('page', parseInt(window.location.hash.substring(1)) || 1 )
            //.orderings('[' + orderCriteria + ']')
            .pageSize(100)
        	.submit(function(err, docs) {
            if (err) { Configuration.onPrismicError(err); return; }

            //songs = $("#list-song-template").html();                      
            //var song_template = Handlebars.compile(songs);

            console.log(docs.results);

            //Change result to an object
            //var all_songs = convertSongsToObject(docs.results);
        });
    });
}