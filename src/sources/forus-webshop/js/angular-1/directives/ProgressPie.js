const ProgressPie = function ($scope) {
    const $dir = $scope.$dir;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const defaultColor = '#1c407b';
    const defaultBackgroundColor = '#ffffff';

    const getGradientColor = (gradientMap, progress) => {
        if (typeof gradientMap == 'function') {
            return gradientMap(progress);
        }

        if (Array.isArray(gradientMap)) {
            const gradientValue = gradientMap.find((item) => progress >= item[0] && progress <= item[1]);

            return gradientValue ? gradientValue[2] : defaultColor;
        }

        return defaultColor;
    };

    const getColor = (progress) => {
        const gradientMap = $dir.gradientMap || null;

        return gradientMap ? getGradientColor(gradientMap, progress) : ($dir.color || defaultColor);
    }

    const getBackgroundColor = () => {
        return $dir.backgroundColor || defaultBackgroundColor;
    }

    const getStrokeColor = (progress) => {
        const gradientMap = $dir.gradientMap || null;

        return gradientMap ? getGradientColor(gradientMap, progress) : ($dir.strokeColor || defaultColor);
    }

    const makeImage = function () {
        const size = parseInt($dir.size || 40);
        const progress = $dir.progress || 0;
        
        const color = getColor(progress);
        const backgroundColor = getBackgroundColor();

        const strokeColor = getStrokeColor(progress);
        const strokeWidth = parseInt($dir.strokeWidth || 4);
        const strokeOffset = strokeWidth ? strokeWidth / 2 : 0;

        if (canvas.width != size || canvas.height != size) {
            canvas.width = size;
            canvas.height = size;
        }

        context.clearRect(0, 0, size, size);

        context.beginPath();
        context.lineWidth = 0;
        context.fillStyle = backgroundColor;
        context.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = (size / 2) - strokeOffset;
        context.arc(size / 2, size / 2, size / 4 - (strokeOffset / 2), -.5 * Math.PI, (-.5 + progress * 2) * Math.PI);
        context.stroke();

        if (strokeWidth) {
            context.beginPath();
            context.strokeStyle = strokeColor;
            context.lineWidth = strokeWidth;
            context.arc(size / 2, size / 2, (size / 2 - strokeWidth / 2), 0, 2 * Math.PI);
            context.stroke();
        }

        return canvas.toDataURL("image/png")
    };

    $dir.$onInit = () => {
        $scope.$watch('$dir.progress', () => $dir.image = makeImage());
        $scope.$watch('$dir.color', () => $dir.image = makeImage());
    };
};

module.exports = () => {
    return {
        scope: {
            size: '@',
            color: '@',
            progress: '=',
            gradientMap: '=',
            backgroundColor: '@',
            strokeColor: '@',
            strokeWidth: '@',
            styleImage: '@',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "E",
        controller: ['$scope', ProgressPie],
        template: "<img z-index='80' style='{{ $dir.styleImage }}' ng-if='$dir.image' ng-src='{{ $dir.image }}'>",
    };
};