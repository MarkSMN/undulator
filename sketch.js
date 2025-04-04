let circles = [];
let selectedCircle = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
// SLOW MEDITATION PHYSICS
let gravity = -0.0003;      // Slight upward drift
let airResistance = 0.96;   // Higher resistance for slower movement
let bounceFactor = 0.5;     // Low energy bounces
let springStrength = 0.003; // Weak springs
let windStrength = 0.0;     // No wind
let windVariation = 0.0;
let mouseInfluence = 0.05;  // Subtle mouse influence

// Vortex variables
let vortexStrength = 0.01;  // Very gentle spinning
let vortexCount = 3;        // Few vortices
let vortexRadius = 600;     // Wide, gentle fieldsn

// Add this near the top of your code with the other physics variables
let enablePhysics = true;  // Physics starts disabled and can be toggled with spacebar
// Key constants
const DELETE = 46;
const BACKSPACE = 8;
const UP_ARROW = 38;
const DOWN_ARROW = 40;

// Leg type constants
const LEG_TYPES = {
    NONE: 'none',
    SINGLE_STRAIGHT: 'single_straight',
    DOUBLE_STRAIGHT: 'double_straight',
    CURVED_LEFT_CENTER: 'curved_left_center',
    CURVED_LEFT_RIGHT: 'curved_left_right',
    CURVED_CENTER_RIGHT: 'curved_center_right'
};

// Animation constants
const minRotationSpeed = 0.0005;
const maxRotationSpeed = .01;
const minInnerCircleRatio = 0.08;
const maxInnerCircleRatio = 0.25;
const sizeChangeSpeed = 2;

// Constants
const minRadius = 15;
const maxRadius = 350;
const maxAttempts = 100;
const canvasWidth = 1080;
const canvasHeight = 1920;
const minCircles = 1;
const maxCircles = 3;
const doubleLegProbability = 0.5;
const offset = 20;
const centerX = canvasWidth / 2;
const STROKE_WIDTH = 4;
const BOTTOM_MARGIN = 2;
const HELP_ZONE = {
    x: 50,             // 40px from left edge
    y: 50,             // 40px from top edge
    radius: 25         // Increased click zone for larger asterisk
};


// Define zones
const zones = [
    {
        name: 'surroundingShape',
        inZone: (x, y) => {
            const centerX = canvasWidth / 2;
            const triangleHeight = canvasHeight * .2;
            const startY = canvasHeight - triangleHeight;
            const slope = triangleHeight / (canvasWidth / 2);
            return !(y > startY && y > canvasHeight - (slope * Math.abs(x - centerX)));
        }
    }
];

const palettes = {
       forestTones: {
        surroundingShape: [
            [22, 46, 37],     // Dark forest green (#162E25)
            [40, 122, 112],   // Teal (#287A70)
            [122, 87, 122],   // Mauve (#7A577A)
            [122, 109, 49],   // Olive (#7A6D31)
            [30, 35, 46]      // Dark navy (#1E232E)
        ]
    },
    
    // From Image 2 - Warm earth and ocean
    earthOcean: {
        surroundingShape: [
            [102, 36, 0],     // Deep brown (#662400)
            [179, 63, 0],     // Burnt orange (#B33F00)
            [255, 107, 26],   // Bright orange (#FF6B1A)
            [0, 102, 99],     // Deep teal (#006663)
            [0, 179, 173]     // Turquoise (#00B3AD)
        ]
    },
    
    // From Image 3 - Vibrant mix
    vibrantMix: {
        surroundingShape: [
            [73, 212, 146],   // Mint (#49D492)
            [123, 98, 171],   // Purple (#7B62AB)
            [4, 39, 61],      // Dark blue (#04273D)
            [33, 130, 197],   // Sky blue (#2182C5)
            [239, 72, 42]     // Red-orange (#EF482A)
        ]
    },
    
    // From Image 4 - Cool purples and greens
    purpleGreen: {
        surroundingShape: [
            [6, 1, 38],       // Deep navy (#060126)
            [94, 83, 166],    // Medium purple (#5E53A6)
            [86, 77, 140],    // Soft purple (#564D8C)
            [77, 140, 104],   // Forest green (#4D8C68)
            [81, 166, 94]     // Bright green (#51A65E)
        ]
    },
    warmNeutral: {
        surroundingShape: [
            [217, 72, 56],    // Coral red
            [247, 150, 82],   // Orange
            [246, 202, 184],  // Peach
            [83, 77, 71],     // Dark gray
            [95, 113, 106],   // Sage green
            [86, 82, 74]      // Brown gray
        ]
    },
    naturalTones: {
        surroundingShape: [
            [238, 201, 69],   // Yellow
            [67, 89, 39],     // Forest green
            [15, 48, 41],     // Dark green
            [76, 70, 118],    // Purple
            [205, 178, 128],  // Tan
            [139, 101, 39]    // Brown
        ]
    },
     redBlue: {
        surroundingShape: [
            [217, 4, 43],     // Bright red (#D9042B)
            [89, 2, 18],      // Dark red (#590212)
            [242, 5, 68],     // Hot pink (#F20544)
            [67, 147, 217],   // Blue (#4393D9)
            [80, 180, 242]    // Light blue (#50B4F2)
        ]
    },
    
    // From Image 2 - Orange gradient
    orangeGradient: {
        surroundingShape: [
            [242, 68, 5],     // Bright orange (#F24405)
            [242, 123, 80],   // Coral (#F27B50)
            [242, 168, 141],  // Light peach (#F2A88D)
            [242, 48, 5],     // Deep orange (#F23005)
            [242, 240, 240]   // Off-white (#F2F0F0)
        ]
    },
    
    // From Image 3 - Burgundy and pink
    burgundyPink: {
        surroundingShape: [
            [89, 22, 28],     // Burgundy (#59161C)
            [242, 75, 106],   // Pink (#F24B6A)
            [166, 155, 146],  // Gray (#A69B92)
            [191, 137, 105],  // Tan (#BF8969)
            [217, 61, 61]     // Red (#D93D3D)
        ]
    },
  grayscale2: {
    surroundingShape: [
        [25, 25, 25],     // Near black
        [75, 75, 75],     // Dark gray
        [130, 130, 130],  // Medium gray
        [180, 180, 180],  // Light gray
        [230, 230, 230],  // Near white
        [50, 50, 50]      // Another dark tone for variety
    ]
},
  grayScale: {
        surroundingShape: [
            [38, 38, 38],     // Dark gray
            [77, 77, 77],     // Medium dark gray
            [115, 115, 115],  // Medium gray
            [153, 153, 153],  // Light medium gray
            [191, 191, 191],  // Light gray
            [255, 255, 0]     // Yellow
        ]
    },
    oceanForest: {
        surroundingShape: [
            [25, 77, 25],    // Forest green
            [25, 25, 153],   // Royal blue
            [51, 102, 204],  // Sky blue
            [48, 25, 89],    // Deep purple
            [51, 51, 179],   // Medium blue
            [0, 0, 128]      // Navy blue
        ]
    }
};

let currentPalette;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.elt.setAttribute('tabindex', '0');
    canvas.elt.style.outline = 'none';
    
    canvas.elt.addEventListener('click', function() {
        this.focus();
    });

    generateComposition();
    initializeVortexPoints();
    createConnections(); 
    loop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    generateComposition();  // Regenerate to fit the new size
}


function draw() {
    background(251);
    circles.sort((a, b) => a.y - b.y);
    
    if (!isDragging) {
        circles.forEach(circle => {
            circle.rotationAngle += circle.rotationSpeed * circle.rotationDirection;
        });
    }
      updatePhysics(); 
    
    if (selectedCircle) {
        if (keyIsDown(UP_ARROW)) {
            if (isValidPosition(selectedCircle.x, selectedCircle.y, 
                selectedCircle.r + sizeChangeSpeed, circles.filter(c => c !== selectedCircle))) {
                selectedCircle.r += sizeChangeSpeed;
                updateCircleLegs(selectedCircle);
            }
        }
        if (keyIsDown(DOWN_ARROW)) {
            if (selectedCircle.r > minRadius + sizeChangeSpeed) {
                selectedCircle.r -= sizeChangeSpeed;
                updateCircleLegs(selectedCircle);
            }
        }
    }
    
    drawConnections();
    drawVerticalLines();
    drawShadows();
    drawCircleMasks();
    drawCircleFills();
    drawInnerCircles();
    drawOutlines();
    
    if (selectedCircle) {
        noFill();
        stroke(0);
        strokeWeight(3);
        ellipse(selectedCircle.x, selectedCircle.y, selectedCircle.r * 2 + 1);
    }
  drawHelpSystem();
}

// Add this function to initialize the vortex points
function initializeVortexPoints() {
  vortexPoints = [];
  for (let i = 0; i < vortexCount; i++) {
    vortexPoints.push({
      x: random(width * 0.2, width * 0.8),
      y: random(height * 0.2, height * 0.8),
      clockwise: random() > 0.5, // Random direction
      strength: random(0.02, 0.08) // Random strength
    });
  }
}

function generateComposition() {
    circles = [];
    selectedCircle = null;
    
    const paletteNames = Object.keys(palettes);
    const randomPaletteName = paletteNames[floor(random(paletteNames.length))];
    currentPalette = palettes[randomPaletteName];
    console.log('Selected palette:', randomPaletteName);
    
    let activeZones = [zones[0]];
    let circlesForZone = generateZoneCircles(activeZones[0], floor(random(2, 12)));
    circles = circles.concat(circlesForZone);
      // Add this code to randomly set some circles as fixed
    circles.forEach(circle => {
        circle.fixed = random() < 0.3;  // 30% chance to be fixed
    });
    
    // Make sure at least one circle is fixed to anchor the composition
    if (!circles.some(c => c.fixed)) {
        circles[0].fixed = true;
    }
}


function generateZoneCircles(zone, count) {
    let zoneCircles = [];
    let attempts = 0;
    
    while (zoneCircles.length < count && attempts < maxAttempts) {
        let r = random(minRadius, maxRadius);
        let x = random(r, width - r);
        let y = random(r, height - r);
        
        if (zone.inZone(x, y) && isValidPosition(x, y, r, zoneCircles)) {
            let newCircle = createCircle(x, y, r, zone.name);
            zoneCircles.push(newCircle);
        }
        
        attempts++;
    }
    
    return zoneCircles;
}

function createCircle(x, y, r, zoneName) {
    let circle = {
        x, 
        y, 
        r,
        rotationAngle: random(TWO_PI),
        rotationSpeed: random(minRotationSpeed, maxRotationSpeed),
        rotationDirection: random() < 0.5 ? 1 : -1,
        innerCircleRatio: random(minInnerCircleRatio, maxInnerCircleRatio),
        legType: (() => {
            const r = random();
            if (r < 0.35) return LEG_TYPES.SINGLE_STRAIGHT;
            if (r < 0.70) return LEG_TYPES.DOUBLE_STRAIGHT;
            if (r < 0.78) return LEG_TYPES.CURVED_LEFT_CENTER;
            if (r < 0.86) return LEG_TYPES.CURVED_CENTER_RIGHT;
            if (r < 0.93) return LEG_TYPES.CURVED_LEFT_RIGHT;
            return LEG_TYPES.NONE;
        })(),
        // Add these physics properties here
        vx: 0,          // Velocity X
        vy: 0,          // Velocity Y
        mass: r * r,    // Mass based on size (r²)
        fixed: false,   // Whether the circle position is fixed
        connections: [] // Array to store connections to other circles
    };
    
    // Select color from current palette's zone-specific colors
    let zonePalette = currentPalette[zoneName];
    let colorIndex = floor(random(zonePalette.length));
    let [r_, g, b] = zonePalette[colorIndex];
    circle.color = color(r_, g, b);
    
    // Initialize legs based on type
    updateCircleLegs(circle);
    
    return circle;
}

function updateCircleLegs(circle) {
    const bottomY = height - BOTTOM_MARGIN; // Floor position

    switch (circle.legType) {
        case LEG_TYPES.NONE:
            circle.lines = [];
            circle.curves = null;
            break;
        case LEG_TYPES.SINGLE_STRAIGHT:
            circle.lines = [{ x: circle.x, y1: circle.y, y2: bottomY }];
            circle.curves = null;
            break;
        case LEG_TYPES.DOUBLE_STRAIGHT:
            circle.lines = [
                { x: circle.x - circle.r / 2, y1: circle.y, y2: bottomY },
                { x: circle.x + circle.r / 2, y1: circle.y, y2: bottomY }
            ];
            circle.curves = null;
            break;
        case LEG_TYPES.CURVED_LEFT_CENTER:
            // Calculate arc height and position
            const arcHeight1 = circle.r;
            const arcY1 = bottomY - (arcHeight1 / 2); // Adjusted to half height
            
            circle.lines = [
                { x: circle.x - circle.r, y1: circle.y, y2: arcY1 },
                { x: circle.x, y1: circle.y, y2: arcY1 }
            ];
            circle.curves = {
                x: circle.x - circle.r / 2,
                y: arcY1,
                w: circle.r,
                h: arcHeight1
            };
            break;
        case LEG_TYPES.CURVED_LEFT_RIGHT:
            // For a full semicircle between the legs
            const arcHeight2 = circle.r;
            const arcY2 = bottomY - arcHeight2;
            
            circle.lines = [
                { x: circle.x - circle.r, y1: circle.y, y2: arcY2 },
                { x: circle.x + circle.r, y1: circle.y, y2: arcY2 }
            ];
            circle.curves = {
                x: circle.x,
                y: arcY2,
                w: circle.r * 2,
                h: circle.r * 2
            };
            break;
       case LEG_TYPES.CURVED_CENTER_RIGHT:
            const arcHeight3 = circle.r;
            const arcY3 = bottomY - (arcHeight3 / 2); // Adjusted to half height
            
            circle.lines = [
                { x: circle.x, y1: circle.y, y2: arcY3 },
                { x: circle.x + circle.r, y1: circle.y, y2: arcY3 }
            ];
            circle.curves = {
                x: circle.x + circle.r / 2,
                y: arcY3,
                w: circle.r,
                h: arcHeight3
            };
            break;
    }
}

function isValidPosition(x, y, r, currentCircles) {
    const spacingMultiplier = .99;
    
    for (let other of currentCircles) {
        let d = dist(x, y, other.x, other.y);
        let minDist = (r + other.r) * spacingMultiplier;
        
        if (d < minDist) {
            return false;
        }
        
        if (x - r < 0 || x + r > width || y - r < 0 || y + r > height) {
            return false;
        }
    }
    return true;
}

function drawVerticalLines() {
    stroke(0);
    strokeWeight(STROKE_WIDTH);

    for (let circle of circles) {
        if (circle.lines) {
            for (let vertLine of circle.lines) {
                line(vertLine.x, vertLine.y1, vertLine.x, vertLine.y2);
            }
        }

        if (circle.curves) {
            noFill();
            arc(circle.curves.x, circle.curves.y, circle.curves.w, circle.curves.h, 0, PI);
        }
    }
}


function drawShadows() {
    stroke(0);
    strokeWeight(0);
    fill(0);
    const vanishX = width/2;  // Updated to use dynamic width
    const vanishY = height/2; // Updated to use dynamic height
    const offsetMultiplier = 0.9;
    const maxDistance = dist(0, 0, width, height);

    for (let circle of circles) {
        let distance = dist(circle.x, circle.y, vanishX, vanishY);
        let depthScale = map(distance, 0, maxDistance, 0, 1);
        let currentOffset = (circle.r * offsetMultiplier) * depthScale;
        
        let dirX = vanishX - circle.x;
        let dirY = vanishY - circle.y;
        let length = sqrt(dirX * dirX + dirY * dirY);
        let normX = dirX / length;
        let normY = dirY / length;
        
        let shadowX = circle.x + (normX * currentOffset);
        let shadowY = circle.y + (normY * currentOffset);
        
        ellipse(shadowX, shadowY, circle.r * 2);
    }
}

function drawCircleMasks() {
    noStroke();
    fill(255);
    for (let circle of circles) {
        ellipse(circle.x, circle.y, circle.r * 2);
    }
}

function drawCircleFills() {
    for (let circle of circles) {
        fill(circle.color);
        ellipse(circle.x, circle.y, circle.r * 2);
    }
}

function drawInnerCircles() {
    noStroke();
    fill(0);
    
    for (let circle of circles) {
        let innerRadius = circle.r * circle.innerCircleRatio;
        let difference = circle.r - innerRadius;
        
        let offsetX = cos(circle.rotationAngle) * difference;
        let offsetY = sin(circle.rotationAngle) * difference;
        
        const vanishX = width/2;  // Updated to use dynamic width
        const vanishY = height/2; // Updated to use dynamic height
        const maxDistance = dist(0, 0, width, height);
        let distance = dist(circle.x, circle.y, vanishX, vanishY);
        let depthScale = map(distance, 0, maxDistance, 0, 1);
        let shadowOffset = (innerRadius * 1.5) * depthScale;
        
        let dirX = vanishX - (circle.x + offsetX);
        let dirY = vanishY - (circle.y + offsetY);
        let length = sqrt(dirX * dirX + dirY * dirY);
        let normX = dirX / length;
        let normY = dirY / length;
        
        ellipse(
            circle.x + offsetX + (normX * shadowOffset),
            circle.y + offsetY + (normY * shadowOffset),
            innerRadius * 2
        );
    }
    
    stroke(0);
    strokeWeight(3);
    fill(255);
    
    for (let circle of circles) {
        let innerRadius = circle.r * circle.innerCircleRatio;
        let difference = circle.r - innerRadius;
        
        let offsetX = cos(circle.rotationAngle) * difference;
        let offsetY = sin(circle.rotationAngle) * difference;
        
        ellipse(
            circle.x + offsetX,
            circle.y + offsetY,
            innerRadius * 2
        );
    }
}

function drawOutlines() {
    noFill();
    stroke(0);
    strokeWeight(3);
    for (let circle of circles) {
        ellipse(circle.x, circle.y, circle.r * 2);
    }
}

function drawHelpSystem() {
    // Draw the blue plus sign
    textSize(45);
    textAlign(CENTER, CENTER);
    fill(0, 0, 255);
    noStroke();
    text('+', HELP_ZONE.x, HELP_ZONE.y);
    
    // Check if mouse is over the help zone
    let d = dist(mouseX, mouseY, HELP_ZONE.x, HELP_ZONE.y);
    if (d < HELP_ZONE.radius) {
        // Draw help guide background - make it taller to fit more text
        fill(255, 255, 255, 240);
        stroke(0);
        strokeWeight(1);
        rect(HELP_ZONE.x + 20, HELP_ZONE.y - 10, 220, 320, 5);
        
        // Draw help text - add new controls
        textAlign(LEFT, TOP);
        textSize(12);
        fill(0);
        noStroke();
        let guide = [
            "CONTROLS:",
            "Click any circle to select it",
            "",
            "With circle selected:",
            "- Click + drag to move",
            "- L - Change leg type",
            "- C - Change color",
            "- F - Toggle fixed position",
            "- ↑/↓ - Resize circle",
            "- DELETE - Remove circle",
            "",
            "General:",
            "- SPACE - Toggle physics",
            "- N - New composition",
            "- A - Add circle",
            "- R - Regenerate connections",
            "",
            "Physics Mode:",
            "- Move mouse quickly to",
            "  influence nearby circles",
            "- Fixed circles don't move",
            "  with physics"
        ];
        
        guide.forEach((line, i) => {
            text(line, HELP_ZONE.x + 30, HELP_ZONE.y - 5 + (i * 14));
        });
    }
    
    // The code that drew purple indicators for fixed circles has been removed
}
function mousePressed() {
    let clickedCircle = findClickedCircle(mouseX, mouseY);
    
    if (clickedCircle) {
        console.log('Circle selected at:', clickedCircle.x, clickedCircle.y);
        selectedCircle = clickedCircle;
        isDragging = true;
        dragStartX = mouseX - clickedCircle.x;
        dragStartY = mouseY - clickedCircle.y;
    } else {
        console.log('No circle clicked');
        selectedCircle = null;
    }
    
    redraw();
    return false;
}

function mouseDragged() {
    if (isDragging && selectedCircle) {
        let newX = mouseX - dragStartX;
        let newY = mouseY - dragStartY;
        
        if (isValidPosition(newX, newY, selectedCircle.r, 
            circles.filter(c => c !== selectedCircle))) {
            selectedCircle.x = newX;
            selectedCircle.y = newY;
            
            // Update legs for new position
            updateCircleLegs(selectedCircle);
        }
        
        redraw();
    }
    return false;
}

function mouseReleased() {
    isDragging = false;
    return false;
}

function findClickedCircle(x, y) {
    for (let i = circles.length - 1; i >= 0; i--) {
        let circle = circles[i];
        let d = dist(x, y, circle.x, circle.y);
        if (d < circle.r) {
            return circle;
        }
    }
    return null;
}

// Create spring connections between nearby circles
function createConnections() {
    // Clear existing connections
    circles.forEach(circle => circle.connections = []);
    
    // Create new connections between circles that are close enough
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            let circle1 = circles[i];
            let circle2 = circles[j];
            
            let distance = dist(circle1.x, circle1.y, circle2.x, circle2.y);
            let maxConnectDist = (circle1.r + circle2.r) * 2;
            
            if (distance < maxConnectDist) {
                // Create bidirectional connection
                circle1.connections.push({
                    target: circle2,
                    restLength: distance, // Natural spring length
                    strength: springStrength
                });
                
                circle2.connections.push({
                    target: circle1,
                    restLength: distance,
                    strength: springStrength
                });
            }
        }
    }
}

// Apply physics simulation to all circles
// Replace your existing updatePhysics() function with this one
function updatePhysics() {
    if (!enablePhysics) return;
    
    // Calculate mouse velocity for influence
    let mouseVelX = mouseX - pmouseX;
    let mouseVelY = mouseY - pmouseY;
    
    for (let circle of circles) {
        if (circle.fixed || isDragging && circle === selectedCircle) continue;
        
        // Apply gentle anti-gravity
        circle.vy += gravity;
        
        // Apply vortex forces
        for (let vortex of vortexPoints) {
            let dx = circle.x - vortex.x;
            let dy = circle.y - vortex.y;
            let distance = sqrt(dx * dx + dy * dy);
            
            if (distance < vortexRadius && distance > 0) {
                // Calculate tangential force (perpendicular to radius)
                let angle = atan2(dy, dx);
                let perpAngle = angle + (vortex.clockwise ? -HALF_PI : HALF_PI);
                
                // Force decreases with distance
                let forceMagnitude = map(distance, 0, vortexRadius, vortex.strength, 0);
                
                // Apply tangential force
                circle.vx += cos(perpAngle) * forceMagnitude;
                circle.vy += sin(perpAngle) * forceMagnitude;
                
                // Slight pull toward vortex center
                circle.vx += -dx/distance * forceMagnitude * 0.1;
                circle.vy += -dy/distance * forceMagnitude * 0.1;
            }
        }
        
        // Apply mouse influence
        let mouseDistance = dist(mouseX, mouseY, circle.x, circle.y);
        let maxInfluenceDist = 200;
        
        if (mouseDistance < maxInfluenceDist && (abs(mouseVelX) > 1 || abs(mouseVelY) > 1)) {
            let influence = map(mouseDistance, 0, maxInfluenceDist, mouseInfluence, 0);
            circle.vx += mouseVelX * influence;
            circle.vy += mouseVelY * influence;
        }
        
        // Apply spring forces from connections
        for (let connection of circle.connections) {
            let other = connection.target;
            let dx = other.x - circle.x;
            let dy = other.y - circle.y;
            let distance = sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Calculate spring force
                let displacement = distance - connection.restLength;
                let springForce = displacement * connection.strength;
                
                // Apply force
                circle.vx += (dx / distance) * springForce;
                circle.vy += (dy / distance) * springForce;
            }
        }
        
        // Apply velocity
        circle.x += circle.vx;
        circle.y += circle.vy;
        
        // Apply air resistance
        circle.vx *= airResistance;
        circle.vy *= airResistance;
        
        // Handle collisions with other circles
        for (let other of circles) {
            if (other === circle) continue;
            
            let dx = other.x - circle.x;
            let dy = other.y - circle.y;
            let distance = sqrt(dx * dx + dy * dy);
            let minDist = circle.r + other.r;
            
            if (distance < minDist) {
                // Calculate collision response
                let angle = atan2(dy, dx);
                let targetX = circle.x + cos(angle) * minDist;
                let targetY = circle.y + sin(angle) * minDist;
                let ax = (targetX - other.x) * 0.05;
                let ay = (targetY - other.y) * 0.05;
                
                // Apply collision forces (adjusted by mass)
                let massRatio1 = circle.mass / (circle.mass + other.mass);
                let massRatio2 = other.mass / (circle.mass + other.mass);
                
                if (!circle.fixed) {
                    circle.vx -= ax * massRatio2 * bounceFactor;
                    circle.vy -= ay * massRatio2 * bounceFactor;
                }
                
                if (!other.fixed) {
                    other.vx += ax * massRatio1 * bounceFactor;
                    other.vy += ay * massRatio1 * bounceFactor;
                }
                
                // Ensure they don't overlap
                if (!circle.fixed && !other.fixed) {
                    let moveX = (minDist - distance) * cos(angle);
                    let moveY = (minDist - distance) * sin(angle);
                    circle.x -= moveX * 0.5;
                    circle.y -= moveY * 0.5;
                    other.x += moveX * 0.5;
                    other.y += moveY * 0.5;
                } else if (!circle.fixed) {
                    circle.x -= (minDist - distance) * cos(angle);
                    circle.y -= (minDist - distance) * sin(angle);
                } else if (!other.fixed) {
                    other.x += (minDist - distance) * cos(angle);
                    other.y += (minDist - distance) * sin(angle);
                }
            }
        }
        
        // Handle collisions with canvas borders
        if (circle.x - circle.r < 0) {
            circle.x = circle.r;
            circle.vx = abs(circle.vx) * bounceFactor;
        } else if (circle.x + circle.r > width) {
            circle.x = width - circle.r;
            circle.vx = -abs(circle.vx) * bounceFactor;
        }
        
        if (circle.y - circle.r < 0) {
            circle.y = circle.r;
            circle.vy = abs(circle.vy) * bounceFactor;
        } else if (circle.y + circle.r > height) {
            circle.y = height - circle.r;
            circle.vy = -abs(circle.vy) * bounceFactor;
        }
        
        // Update circle legs to new position
        updateCircleLegs(circle);
    }
}

// Draw spring connections as dashed lines
function drawConnections() {
    // Function is kept but does nothing now - connection lines are hidden
    // The physics of connections will still work, just without visual representation
}

function keyPressed(event) {
    if (keyCode === 32) {  // Space bar
        enablePhysics = !enablePhysics;  // Toggle physics mode
        console.log('Physics mode:', enablePhysics ? 'enabled' : 'disabled');
        return false;
    }
    
    console.log('Key pressed:', keyCode);
    
    if (keyCode !== 78 && keyCode !== 65 && !selectedCircle) {
        console.log('No circle selected');
        return false;
    }
      // Add handler for F key (fixed toggle)
    if (keyCode === 70) {  // 'F' key
        if (selectedCircle) {
            selectedCircle.fixed = !selectedCircle.fixed;
            console.log('Circle fixed:', selectedCircle.fixed);
            redraw();
        }
        return false;
    }
    
    // Add handler for R key (regenerate connections)
    if (keyCode === 82) {  // 'R' key
        createConnections();
        console.log('Connections regenerated');
        return false;
    }
    
    switch (keyCode) {
        case BACKSPACE:
        case DELETE:
            console.log('Trying to delete circle');
            circles = circles.filter(circle => circle !== selectedCircle);
            selectedCircle = null;
            redraw();
            break;
        case UP_ARROW:
            console.log('Trying to increase radius');
            if (isValidPosition(selectedCircle.x, selectedCircle.y, 
                selectedCircle.r + 5, circles.filter(c => c !== selectedCircle))) {
                selectedCircle.r += 5;
                updateCircleLegs(selectedCircle);
                redraw();
            }
            break;
        case DOWN_ARROW:
            if (selectedCircle.r > minRadius + 5) {
                selectedCircle.r -= 5;
                updateCircleLegs(selectedCircle);
                redraw();
            }
            break;
        case 78: // 'N' key
            generateComposition();
            redraw();
            break;
        case 65: // 'A' key
            let attempts = 0;
            while (attempts < maxAttempts) {
                let r = random(minRadius, maxRadius);
                let x = random(r, width - r);
                let y = random(r, height - r);
                
                if (zones[0].inZone(x, y) && isValidPosition(x, y, r, circles)) {
                    let newCircle = createCircle(x, y, r, 'surroundingShape');
                    circles.push(newCircle);
                    selectedCircle = newCircle;
                    break;
                }
                attempts++;
            }
            redraw();
            break;
case 76: // 'L' key
    if (!selectedCircle) return;
    
    const legTypes = Object.values(LEG_TYPES);
    const currentIndex = legTypes.indexOf(selectedCircle.legType);
    const nextIndex = (currentIndex + 1) % legTypes.length;
    selectedCircle.legType = legTypes[nextIndex];
    
    console.log('Changing leg type to:', selectedCircle.legType); // Add this line
    
    updateCircleLegs(selectedCircle);
    redraw();
    break;
        case 67: // 'C' key
            let zonePalette = currentPalette.surroundingShape;
            let currentColorStr = selectedCircle.color.toString();
            let nextColorIndex = 0;
            
            for (let i = 0; i < zonePalette.length; i++) {
                let [r, g, b] = zonePalette[i];
                if (color(r, g, b).toString() === currentColorStr) {
                    nextColorIndex = (i + 1) % zonePalette.length;
                    break;
                }
            }
            
            let [r, g, b] = zonePalette[nextColorIndex];
            selectedCircle.color = color(r, g, b);
            redraw();
            break;
    }
    
    return false;
} 
