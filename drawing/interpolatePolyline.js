export function interpolatePolyline(t, polyline) {
    // Normalize t to the total length of the polyline
    let totalLength = 0;
    for(let i = 0; i < polyline.length - 1; i++) {
        let dx = polyline[i + 1].x - polyline[i].x;
        let dy = polyline[i + 1].y - polyline[i].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    let targetLength = t * totalLength;
    let length = 0;

    for(let i = 0; i < polyline.length - 1; i++) {
        let dx = polyline[i + 1].x - polyline[i].x;
        let dy = polyline[i + 1].y - polyline[i].y;
        let segmentLength = Math.sqrt(dx * dx + dy * dy);

        if(length + segmentLength > targetLength) {
            let segmentT = (targetLength - length) / segmentLength;
            return {
                x: polyline[i].x + dx * segmentT,
                y: polyline[i].y + dy * segmentT
            };
        }

        length += segmentLength;
    }

    // If for some reason we've reached the end without returning, return the last vertex
    return polyline[polyline.length - 1];
}