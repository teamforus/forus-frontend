let HallOfFameComponent = function() {
	var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
	};

	function loadMembers() {
	  // github pagination lists 30 repo's as default
	  // page=41 is a hacky way to get all our repo's
	  getJSON('http://136.144.187.106/hall-of-fame',
		  function(err, contributors) {
		    if (err !== null) {
		      alert('Something went wrong: ' + err)
		    } else {
		      loadToPage(contributors);
		    }
		});
	}

	function loadToPage(sortedContributors) {
	  sortedContributors.forEach(function(element) {

	    var newDiv = document.createElement("div"); 
	    newDiv.setAttribute("class", "contributor");

	    newDiv.appendChild(document.createTextNode(element[0]));
	    newDiv.appendChild(document.createElement("br")); 

	    var profilePic = document.createElement("IMG");
	    profilePic.setAttribute("src", 'https://github.com/'+element[0]+'.png?size=200');
	    profilePic.setAttribute('height', '200px');
	    profilePic.setAttribute('width', '200px');
	    newDiv.appendChild(profilePic); 

	    newDiv.appendChild(document.createElement("br")); 

	    newDiv.appendChild(document.createTextNode(element[1])); 

	    newDiv.appendChild(document.createElement("br")); 
	    newDiv.appendChild(document.createElement("br")); 

	    var currentClass = document.getElementsByClassName('test2')[0];
        document.body.appendChild(newDiv, currentClass);
	  });
	}

	loadMembers();
};

module.exports = {
    controller: [
        HallOfFameComponent
    ],
    templateUrl: 'assets/tpl/pages/website/hall-of-fame.html'
};