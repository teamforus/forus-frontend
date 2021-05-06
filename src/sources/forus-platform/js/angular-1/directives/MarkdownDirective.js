let MarkdownDirective = function($scope, $element, $timeout, ModalService) {
    const $theEditor = $($element.find('[editor]')[0]);

    const getCustomLink = (type, values) => {
        return new Promise((resolve) => $timeout(() => {
            ModalService.open('markdownCustomLink', {
                type: type,
                values: values,
                hasDescription: type != 'youtubeLink',
                success: (data) => {
                    const { url, text, uid } = data;

                    if (uid && $scope.mediaUploaded) {
                        $scope.mediaUploaded({
                            media_uid: uid,
                        });
                    }

                    resolve({ ...values, ...{ url, text } });
                }
            });
        }, 0));
    }

    const CmsButton = (type = 'customLink', icon = "link") => {
        return function(context) {
            const ui = $.summernote.ui;
            const btnIcon = context.options.icons[icon];

            const showLinkDialog = function(linkInfo) {
                return new Promise((resolve) => {
                    const { text, url } = linkInfo;

                    getCustomLink(type, { text, url }).then((linkInfoResp) => {
                        resolve({ ...linkInfo, ...linkInfoResp });
                    });
                });
            };

            // create button
            const button = ui.button({
                contents: `<em class="${btnIcon}"/>`,
                // tooltip: 'hello',
                click: function() {
                    context.invoke('editor.saveRange');

                    if (type === 'customLink') {
                        const linkInfo = context.invoke('editor.getLinkInfo');
                        const { url, text } = linkInfo;

                        showLinkDialog({ url, text }).then((data) => {
                            context.invoke('editor.restoreRange');
                            context.invoke('editor.createLink', { ...linkInfo, ...data });
                        }, () => context.invoke('editor.restoreRange'));
                    }

                    if (type === 'imageLink' || type === 'youtubeLink') {
                        showLinkDialog({}).then((data) => {
                            context.invoke('editor.restoreRange');

                            if (type === 'imageLink') {
                                context.invoke('editor.insertImage', data.url || '', 'filename');
                            }

                            if (type === 'youtubeLink') {
                                const url = data.url
                                    .replace('https://youtu.be/', 'https://www.youtube.com/embed/')
                                    .replace('https://www.youtube.com/watch?v=', 'https://www.youtube.com/embed/')
                                    .split('&')[0];

                                const template =
                                    `<div class="youtube-root">` +
                                    `<iframe src="${url}" frameborder="0" allowfullscreen="1"></iframe>` +
                                    `</div>`;

                                context.invoke('editor.insertNode', $(template)[0]);
                            }
                        }, () => context.invoke('editor.restoreRange'));
                    }
                }
            });

            return button.render();   // return button as jquery object
        }
    }

    $theEditor.html($scope.value);

    $theEditor.summernote({
        placeholder: '',
        tabsize: 2,
        height: 400,
        disableDragAndDrop: true,
        disableResizeImage: true,
        icons: {
            bold: 'mdi mdi-format-bold',
            italic: 'mdi mdi-format-italic',
            underline: 'mdi mdi-format-underline',
            eraser: 'mdi mdi-format-clear',

            caret: 'mdi mdi-menu-down',
            magic: 'mdi mdi-format-size',

            unorderedlist: 'mdi mdi-format-list-numbered',
            orderedlist: 'mdi mdi-format-list-bulleted',

            table: 'mdi mdi-table',
            close: 'mdi mdi-close',
            arrowsAlt: 'mdi mdi-fullscreen',

            link: 'mdi mdi-link',
            unlink: 'mdi mdi-link-off',
            picture: 'mdi mdi-image',
            video: 'mdi mdi-youtube',
        },

        styleTags: ['h1', 'h2', 'h3', 'h4', 'p'],
        toolbar: [...[
            ['style', ['style']],
            ['font', ['bold', 'italic', 'clear']],
            ['para', ['ol', 'ul']],
        ], ...($scope.extendedOptions ? [
            ['cms', ['cmsLink', 'unlink', 'cmsMedia', 'cmsLinkYoutube']],
        ] : []), ...[
            ['view', ['fullscreen']],
        ]],
        buttons: {
            cmsLink: CmsButton('customLink', 'link'),
            cmsMedia: CmsButton('imageLink', 'picture'),
            cmsLinkYoutube: CmsButton('youtubeLink', 'video'),
        },
        callbacks: {
            onChange: function(contents, $editable) {
                const turndownService = (new TurndownService());

                turndownService.addRule('strikethrough', {
                    filter: (node) => {
                        return node.className === 'youtube-root' && node.children.length > 0 &&
                            node.children[0].tagName.toLowerCase() === 'iframe';
                    },
                    replacement: function() {
                        return `[](${arguments[1].children[0].src.replace(
                            'https://www.youtube.com/embed/',
                            'https://www.youtube.com/watch?v='
                        )})`;
                    }
                });

                $scope.value = contents;
                $scope.ngModel = turndownService.turndown(contents);
            },
            onPaste: function(e) {
                var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                e.preventDefault();
                document.execCommand('insertText', false, bufferText);
            }
        },
    });

    $theEditor.summernote("removeModule", "linkPopover");
    $theEditor.summernote("removeModule", "imagePopover");

    if ($scope.disabled === 'true') {
        $theEditor.summernote('disable');
    }
};


module.exports = () => {
    return {
        restrict: "EA",
        scope: {
            value: '=',
            ngModel: '=',
            modal: '=',
            mediaUploaded: '&',
            disabled: '@',
            extendedOptions: '='
        },
        popover: {
            link: [],
        },
        replace: true,
        controller: [
            '$scope',
            '$element',
            '$timeout',
            'ModalService',
            MarkdownDirective
        ],
        templateUrl: 'assets/tpl/directives/markdown.html'
    };
};