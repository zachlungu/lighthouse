"use strict";
/**
Copyright 2016 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../metric_registry.js");
require("./utils.js");
require("../../model/model.js");
require("../../value/histogram.js");

'use strict';

global.tr.exportTo('tr.metrics.sh', function () {
  function syncIsComplete(markers) {
    return markers.length === 2;
  }

  function syncInvolvesTelemetry(markers) {
    for (var marker of markers) if (marker.domainId === tr.model.ClockDomainId.TELEMETRY) return true;

    return false;
  }

  function clockSyncLatencyMetric(values, model) {
    for (var markers of model.clockSyncManager.markersBySyncId.values()) {
      var latency = undefined;
      var targetDomain = undefined;
      if (!syncIsComplete(markers) || !syncInvolvesTelemetry(markers)) continue;

      for (var marker of markers) {
        var domain = marker.domainId;
        if (domain === tr.model.ClockDomainId.TELEMETRY) latency = marker.endTs - marker.startTs;else targetDomain = domain.toLowerCase();
      }

      var hist = new tr.v.Histogram('clock_sync_latency_' + targetDomain, tr.b.Unit.byName.timeDurationInMs_smallerIsBetter, tr.v.HistogramBinBoundaries.createExponential(1e-3, 1e3, 30));
      hist.description = 'Clock sync latency for domain ' + targetDomain;
      hist.addSample(latency);
      values.addHistogram(hist);
    }
  }

  tr.metrics.MetricRegistry.register(clockSyncLatencyMetric);

  return {
    clockSyncLatencyMetric: clockSyncLatencyMetric
  };
});