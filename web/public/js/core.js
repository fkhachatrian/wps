angular.module('WhatPeopleSay', [
    'ngMap',
    'ngTagCloud',
    'infinite-scroll',
    'angularInlineEdit',
    'WhatPeopleSay.TopicControllers', 
    'WhatPeopleSay.TrendsControllers', 
    'WhatPeopleSay.ChartControllers', 
    'WhatPeopleSay.LocalizedControllers', 
    'WhatPeopleSay.RecordControllers',
    'WhatPeopleSay.KeywordControllers',
    'trendsService',
    'topicService',
    'chartService',
    'localizedService',
    'recordService',
    'keywordService'
]);