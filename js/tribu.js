function displayContributionsList(){
    var query = "[";

    query += '[:d = at(document.type, "contribution")]';

    var selectedTheme = $('#theme_filter input:radio:checked').val();
    if(selectedTheme){
        query += '[:d = at(my.contribution.theme, "' + selectedTheme + '")]';        
    }

    var searchQuery = $('#searchQuery').val();
    if(searchQuery){
        query += '[:d = fulltext (document, "' + searchQuery + '")]';
    }

    query += "]"

    Helpers.withPrismic(function(ctx) {
        var request = ctx.api.form("everything").ref(ctx.ref);

        request.query(query);

        request.set('page', parseInt(window.location.hash.substring(1)) || 1 )
            .pageSize(100)
            .submit(function(err, docs) {
            if (err) { Configuration.onPrismicError(err); return; }

            var contrib = $("#contribution-item-template").html();                      
            var contrib_template = Handlebars.compile(contrib);

            //Change result to an object
            var all_contrib = convertContribToObject(docs.results);

            $("#contributions").html(contrib_template(all_contrib));
        });
    });
}


function Contribution(id, uid, titre, imageUrl, categorie, theme, contenu) {
    this.id = id;
    this.uid = uid;
    this.titre = titre;
    this.imageUrl = imageUrl;
    this.categorie = categorie;
    this.theme = theme;
    this.contenu = contenu;
   
    this.url = function() {return "/contribution-details.html?id="+ this.id + "&uid="+this.uid;};
}

function convertContribToObject(prismicResults){
    contributionObjectList = [];

    prismicResults.forEach(function(prismic_contrib){

        var contenu = prismic_contrib.getStructuredText('contribution.contenu');

        var imageUrl = "/img/favicon.ico";

        if(contenu.getFirstImage()){
            imageUrl = contenu.getFirstImage().url;
        }

        var extrait = _.take(contenu.asText().split(' '), 80).join(' ');
        extrait += " ..."

        var contribution = new Contribution(prismic_contrib.id, prismic_contrib.uid, prismic_contrib.getStructuredText('contribution.titre').asHtml(),
            imageUrl, prismic_contrib.data['contribution.categorie'].value, prismic_contrib.data['contribution.theme'].value, extrait);

        contributionObjectList.push(contribution);
    });

    return contributionObjectList;
}

function displayContributionDetails(){
    Helpers.withPrismic(function(ctx) {

        // Retrieve the document
        var uid = Helpers.queryString['uid'];
        var id = Helpers.queryString['id'];

        ctx.api.form("everything").ref(ctx.ref).query('[[:d = at(document.id, "' + id + '")]]').submit(function(err, docs) {

            if (err) { Configuration.onPrismicError(err); return; }

            var doc = docs.results[0];

            // If there is no documents for this id
            if(!doc) {
                document.location = '404.html';
            }

            var contribution_data = new Contribution(doc.id, doc.uid, doc.getStructuredText('contribution.titre').asHtml(),
                "", doc.data['contribution.categorie'].value, doc.data['contribution.theme'].value, doc.getStructuredText('contribution.contenu').asHtml());

            var contrib = $("#contribution-item-template").html();                      
            var contrib_template = Handlebars.compile(contrib);

            $("#contribution-detail").html(contrib_template(contribution_data));

            //document.title = "AgileTribu - " + doc.data['formation.name'].value;
        });
    });

}

function displayTribuMembers(){
	Helpers.withPrismic(function(ctx) {
		var request = ctx.api.form("everything").ref(ctx.ref);

        var query = '[[:d = at(document.type, "formateur")]]'
        request.query(query);

        request.set('page', parseInt(window.location.hash.substring(1)) || 1 )
            .pageSize(100)
        	.submit(function(err, docs) {
            if (err) { Configuration.onPrismicError(err); return; }

            var team = $("#team-item-template").html();                      
            var team_template = Handlebars.compile(team);

            //Change result to an object
            var all_tribu_members = convertTribuMembersToObject(docs.results);

            $("#team").html(team_template(all_tribu_members))

            launchCarousel();
        });
    });
}


function TribuMember(id, slug, name, photoUrl, extrait_bio, full_bio, liens) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.photoUrl = photoUrl;
    this.extrait_bio = extrait_bio;
    this.full_bio = full_bio;
    this.liens = liens;
   
    this.url = function() {return "http://formation.agiletribu.com/formateur.html?id="+this.id+"&slug="+this.slug;};
}

function convertTribuMembersToObject(prismicResults){
    formateurObjectList = [];

    prismicResults.forEach(function(prismic_formateur){

        var bio = prismic_formateur.getStructuredText('formateur.bio');
        var extrait = _.take(bio.getFirstParagraph().text.split(' '), 40).join(' ');
        extrait += " ..."

        var liens = [];        
        if(prismic_formateur.data['formateur.liens']){
            var prismicLiens = prismic_formateur.data['formateur.liens'].value;
            prismicLiens.forEach(function(prismic_lien){
                var type = prismic_lien.site.value;
                var url = prismic_lien.url.value.url;

                var html_lien = '<a href="' + url +'" class="fa fa-' + type + '"></a>';
                liens.push(html_lien);
            });
        }

        var member = new TribuMember(prismic_formateur.id, prismic_formateur.slug, prismic_formateur.data['formateur.name'].value,
            prismic_formateur.data['formateur.image'].value.main.url, extrait, bio.asHtml(), liens);

        formateurObjectList.push(member);
    });

    return formateurObjectList;
}

function injectHomePageContent(){
    Helpers.withPrismic(function(ctx) {
        var request = ctx.api.form("everything").ref(ctx.ref);

        var query = '[[:d = at(document.type, "tribu-home")]]'
        request.query(query);

        request.set('page', parseInt(window.location.hash.substring(1)) || 1 )
            .pageSize(100)
            .submit(function(err, docs) {
            if (err) { Configuration.onPrismicError(err); return; }
            
        });
    });

}

function launchCarousel(){

    $("#team_carousel").owlCarousel({
        autoPlay: 3000,
        stopOnHover : true,

        itemsCustom : [
            [0, 1],
            [450, 1],
            [660, 2],
            [700, 2],
            [1200, 3],
            [1600, 3]
        ],
        navigation : false,
        pagination: true
  });
}

//To navigate smoothly when clicking on the header
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

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
}

function addFiltersHandler(){
    $("#theme_filter").on('click', function() { displayContributionsList(); });
    $("#searchButton").on('click', function() { displayContributionsList(); });
}
