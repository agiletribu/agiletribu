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

            console.log(docs.results);


            var team = $("#team-item-template").html();                      
            var team_template = Handlebars.compile(team);

            //Change result to an object
            var all_tribu_members = convertTribuMembersToObject(docs.results);

            $("#team").html(team_template(all_tribu_members))

            launchCarousel();
        });
    });
}


function TribuMember(id, slug, name, photoUrl, bio) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.photoUrl = photoUrl;
    this.bio = bio;
   
    this.url = function() {return "song.html?id="+this.id+"&slug="+this.slug;};
}

function convertTribuMembersToObject(prismicResults){
    formateurObjectList = [];

    prismicResults.forEach(function(prismic_formateur){

        var bio = prismic_formateur.getStructuredText('formateur.bio').asHtml()

        var member = new TribuMember(prismic_formateur.id, prismic_formateur.slug, prismic_formateur.data['formateur.name'].value,
            prismic_formateur.data['formateur.image'].value.main.url, bio);

        formateurObjectList.push(member);
    });

    return formateurObjectList;
}

function launchCarousel(){
  var owl = $("#team_carousel");
  console.log(owl);

  owl.owlCarousel({
     
      itemsCustom : [
        [0, 1],
        [450, 1],
        [660, 2],
        [700, 2],
        [1200, 3],
        [1600, 3]
      ],
      navigation : false,
      pagination: true,
  });
}

function enableSmoothScroll(){
    $('a.scroll').click(function() {
      if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top -50
          }, 1000);
          return false;
        }
      }
    });
}