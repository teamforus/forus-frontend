let HallOfFameComponent = function(
    hofService,
) {
    let $ctrl = this;
    hofService.get().then(function(response) {
        console.log(response.data)
        console.log("yo")
        $ctrl.list = response.data

        var list = response.data

        console.log(list)

        list.forEach(function(element) {
         var image = 'https://github.com/'+element[0]+'.png?size=200'

         console.log('deze shit word gecalled')
         // console.log('hey' + image)

         // $ctrl.images.append(image)
        }

        // console.log(response.data[1][0])
    });
    hofService.get()

    $ctrl.eentest = "blabla"

    console.log("jjajaaalkjlkajd")



    // new variable images[]

    // $ctrl.images = []

    // sortedContributors.forEach(function(element) {
    // 	var image = 'https://github.com/'+element[0]+'.png?size=200'

    // 	$ctrl.images.append(image)
    // }

};

module.exports = {
    controller: [
        'hofService',
        HallOfFameComponent
    ],
    templateUrl: 'assets/tpl/pages/website/hall-of-fame.html'
};