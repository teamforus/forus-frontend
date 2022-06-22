let AnnouncementsDirective = function(
    $scope,
    $timeout,
    appConfigs
) {
    let $dir = $scope.$dir = {};
    $dir.dismissed = JSON.parse(localStorage.getItem('dismissed_announcements'));
    $dir.announcements = filterAnnouncements(appConfigs.features.announcements);

    function filterAnnouncements(announcements) {
        return announcements.filter((announcement) => !$dir.dismissed.includes(announcement.id));
    }

    if (!Array.isArray($dir.dismissed)) {
        $dir.dismissed = [];
    }

    $dir.dismiss = function(announcement) {
        announcement.dismissed = true;

        $timeout(() => {
            let index = $dir.announcements.indexOf(announcement);
            $dir.announcements.splice(index, 1);
            $dir.dismissed.push(announcement.id);
            localStorage.setItem('dismissed_announcements', JSON.stringify($dir.dismissed));
        }, 400);
    };
};

module.exports = () => {
    return {
        scope: {},
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            'appConfigs',
            AnnouncementsDirective
        ],
        templateUrl: 'assets/tpl/directives/announcements.html',
    };
};