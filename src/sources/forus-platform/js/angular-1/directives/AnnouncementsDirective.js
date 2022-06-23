const AnnouncementsDirective = function (
    $scope,
    $timeout
) {
    const $dir = $scope.$dir;
    const storageKey = 'dismissed_announcements';

    $dir.dismiss = (announcement) => {
        announcement.dismissed = true;

        $timeout(() => {
            $dir.announcements.splice($dir.announcements.indexOf(announcement), 1);
            $dir.dismissed.push(announcement.id);

            localStorage.setItem(storageKey, JSON.stringify($dir.dismissed));
        }, 400);
    };

    $dir.$onInit = () => {
        $dir.dismissed = JSON.parse(localStorage.getItem(storageKey));
        $dir.dismissed = Array.isArray($dir.dismissed) ? $dir.dismissed : [];
        $dir.announcements = $dir.list.filter((item) => !$dir.dismissed.includes(item.id));
    };
};

module.exports = () => {
    return {
        scope: {
            list: "=",
        },
        replace: true,
        bindToController: true,
        controllerAs: '$dir',
        restrict: "AE",
        controller: [
            '$scope',
            '$timeout',
            AnnouncementsDirective
        ],
        templateUrl: 'assets/tpl/directives/announcements.html',
    };
};