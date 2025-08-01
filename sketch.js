 let circles = [];
    let selectedCircle = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    
// SLOW MEDITATION PHYSICS
    
    let gravity = -0.0003;      // Slight upward drift
    let airResistance = 0.8;   // Higher resistance for slower movement
    let bounceFactor = .01;     // Low energy bounces
    let springStrength = .00003; // Weak springs
    let windStrength = 0.0;     // No wind
    let windVariation = 0.0;
    let mouseInfluence = 0.00;  // Subtle mouse influence
    
    let autoRegenerate = false; // Whether to automatically regenerate       composition
    let lastRegenTime = 0; // Last time composition was regenerated
    const regenInterval = 60000; // Regeneration interval in milliseconds (60 seconds)

    // REST STATE VARIABLES - NEW
    let restState = false;      // Tracks whether we've reached a "rest state" for circles
    let restDistance = 50;      // Distance threshold to consider a circle "at rest" near 1       gravity point
    let restThreshold = 0.05;   // Speed threshold to consider a circle "at rest"

    let gravityPoint = { x: 0, y: 0 };
    let gravityStrength = .005;  // Adjust this value to control pull strength
    let gravityRadius = 8000;      // How far the gravity effect reaches

    let sunBounceEnabled = true;    // Toggle for the sun bounce effect
    let bounceDamping = 0.99;       // How much energy is lost with each bounce (0.75 =           75% retained)
    let bounceThreshold = 0.2;      // Minimum velocity to register a bounce
    let bounceRepulsionStrength = 0.915; // Strength of the bounce repulsion
    let maxBounces = 5;             // Maximum number of bounces to track

    let bounceEffects = [];  // Array to store visual bounce effects

    // Vortex variables
    let vortexStrength = 0.0;  // Very gentle spinning
    let vortexCount = 3;        // Few vortices
    let vortexRadius = 600;     // Wide, gentle fields

    let sunRepulsionRadius = 80;    // Distance where repulsion starts
    let sunRepulsionStrength = 0.08; // Strength of the repulsion force
    let sunElasticity = 1;        // How elastic the bounce is (0-1)

    let gravityWarmupPeriod = 500; // Time in milliseconds for gravity to reach full strength
    let gravityStartTime = 0;      // Will be set when composition is generated
    let gravityDeadZone = 50;      // Minimum distance from gravity point (prevents jiggling)
    let gravitySmoothingFactor = 1.3; // Additional damping when close to gravity point

    // Add this near the top of your code with the other physics variables
    let enablePhysics = false;  // Physics starts disabled and can be toggled with spacebar
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
    const maxRotationSpeed = .101;
    const minInnerCircleRatio = 0.08;
    const maxInnerCircleRatio = 0.25;
    const sizeChangeSpeed = 2;

    // Constants
    const minRadius = 10;
    const maxRadius = 350;
    const maxAttempts = 100;
    const canvasWidth = 1080;
    const canvasHeight = 1920;
    const minCircles = 1;
    const maxCircles = 3;
    const doubleLegProbability = 0.1;
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
        jewelEarth: {
            surroundingShape: [ 
                [49, 32, 97],     // Deep purple (#312061)
                [95, 85, 143],    // Medium purple (#5F558F)
                [11, 46, 43],     // Deep forest green (#0B2E2B)
                [61, 77, 40],     // Olive green (#3D4D28)
                [148, 103, 40],   // Golden brown (#946728)
                [212, 186, 131]   // Tan/gold (#D4BA83)
            ]
        },  
      
        blueOrange: {
        surroundingShape: [
            [173, 216, 230],  // Light Blue (#ADD8E6)
            [135, 206, 235],  // Sky Blue (#87CEEB)
            [176, 224, 230],  // Powder Blue (#B0E0E6)
            [198, 226, 255],  // Alice Blue (#C6E2FF)
            [210, 235, 250],  // Pale Blue (#D2EBFA)
            [240, 248, 255],  // Azure (#F0F8FF)
            [204, 85, 0],     // Burnt Orange (#CC5500)
            [153, 51, 0]      // Deep Orange (#993300)
        ]
    },
      forestTones: {
            surroundingShape: [
                [22, 46, 37],     // Dark forest green (#162E25)
                [40, 122, 112],   // Teal (#287A70)
                [122, 87, 122],   // Mauve (#7A577A)
                [122, 109, 49],   // Olive (#7A6D31)
                [30, 35, 46],     // Dark navy (#1E232E)
                [195,183,130],
                [190,163,190],
                [121,171,156]          
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
        
        orangeGradient: {
            surroundingShape: [
                [242, 68, 5],     // Bright orange (#F24405)
                [242, 123, 80],   // Coral (#F27B50)
                [242, 168, 141],  // Light peach (#F2A88D)
                [242, 48, 5],     // Deep orange (#F23005)
                [242, 240, 240]   // Off-white (#F2F0F0)
            ]
        },
        
        burgundyPink: {
            surroundingShape: [
                [140, 45, 50],    // Lightened burgundy (#8C2D32)
                [242, 75, 106],   // Pink (#F24B6A)
                [166, 155, 146],  // Gray (#A69B92)
                [220, 180, 160],  // Lightened tan (#DCB4A0)
                [217, 61, 61],    // Red (#D93D3D)
                [255, 182, 193]   // Soft pink (#FFB6C1)
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
        
        // New palettes based on midcentury design
        
        eamesPalette: {
            surroundingShape: [
                [227, 65, 50],    // Eames red (#E34132)
                [234, 172, 54],   // Mustard yellow (#EAAC36)
                [60, 95, 156],    // Blue (#3C5F9C)
                [33, 41, 47],     // Charcoal (#21292F)
                [242, 242, 238]   // Off-white (#F2F2EE)
            ]
        },
        
        neutraTones: {
            surroundingShape: [
                [204, 197, 185],  // Light taupe (#CCC5B9)
                [89, 87, 87],     // Dark gray (#595757)
                [232, 221, 203],  // Cream (#E8DDCB)
                [155, 175, 161],  // Sage green (#9BAFA1)
                [240, 234, 214]   // Ivory (#F0EAD6)
            ]
        },
        
        pastelMid: {
            surroundingShape: [
                [241, 180, 187],  // Dusty rose (#F1B4BB)
                [184, 215, 212],  // Mint (#B8D7D4)
                [249, 220, 196],  // Peach (#F9DCC4)
                [196, 169, 186],  // Lilac (#C4A9BA)
                [95, 91, 97]      // Dark gray (#5F5B61)
            ]
        },
        
        scandiMid: {
            surroundingShape: [
                [242, 233, 228],  // Light cream (#F2E9E4)
                [189, 154, 137],  // Wood tone (#BD9A89)
                [119, 103, 93],   // Brown (#77675D)
                [86, 121, 115],   // Teal green (#567973)
                [67, 68, 71]      // Charcoal (#434447)
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
        // Gravity point is already initialized in generateComposition
        lastRegenTime = millis();
        initializeVortexPoints();
        createConnections(); 
        
        // Initialize timer with current time
        lastRegenTime = millis();
        
        loop();
    }

    function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
        generateComposition();  // Regenerate to fit the new size
    }


    function draw() {
        // Check if auto-regenerate is enabled and if enough time has passed
        if (autoRegenerate && millis() - lastRegenTime > regenInterval) {
            console.log('Auto-regenerating composition');
            generateComposition();
            initializeVortexPoints();
            createConnections();
            lastRegenTime = millis(); // Reset timer
        }
        ///movingshadow
        background(120,250);
        circles.sort((a, b) => a.y - b.y);
        
        if (!isDragging) {
            circles.forEach(circle => {
                // Update the orbit angle for circles with orbiting elements
                if (circle.orbitEnabled) {
                    circle.orbitAngle += circle.orbitDirection * circle.orbitSpeed;
                }
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
        drawOrbitingCircles(); // New function to draw the orbiting circles
        drawOutlines();
        drawBounceEffects(); 
        
        if (selectedCircle) {
            noFill(0);
            stroke(0);
            strokeWeight(3);
            ellipse(selectedCircle.x, selectedCircle.y, selectedCircle.r * 2 + 1);
        }

        drawHelpSystem();
    }
    
function createBounceEffect(x, y, size) {
  bounceEffects.push({
    x: x,
    y: y,
    size: size,
    alpha: 255,
    life: 255,  // Life counter for the effect
    color: color(255, 255, 255, 255)
  });
}
    function drawOrbitingCircles() {
        for (let circle of circles) {
            if (!circle.orbitEnabled) continue;
            
            // Calculate the available radius within the colored circle
            let availableRadius = circle.r;
            
            // Use the orbitingCircleRatio to determine the size of the orbiting circle
            // This will be 10-90% of the main circle's radius (not diameter)
            let orbitingCircleRadius = availableRadius * circle.orbitingCircleRatio;
            
            // Ensure the orbiting circle doesn't exceed the parent circle boundary
            // by limiting how far it can travel from the center
            let maxTravelDistance = availableRadius - orbitingCircleRadius;
            
            // If maxTravelDistance is negative, adjust orbiting circle size
            if (maxTravelDistance < 0) {
                orbitingCircleRadius = availableRadius * 0.4; // Fallback to 40% of parent
                maxTravelDistance = availableRadius - orbitingCircleRadius;
            }
            
            // Calculate the position of the orbiting circle
            // Use a percentage of the maxTravelDistance to ensure it stays within bounds
            let orbitDistance = maxTravelDistance * 0.8; // Using 80% of max to ensure it stays inside
            let orbitX = circle.x + cos(circle.orbitAngle) * orbitDistance;
            let orbitY = circle.y + sin(circle.orbitAngle) * orbitDistance;
            
            // Calculate shadow properties for depth
            const vanishX = width/2;
            const vanishY = height/2;
            const maxDistance = dist(0, 0, width, height);
            let distance = dist(circle.x, circle.y, vanishX, vanishY);
            let depthScale = map(distance, 0, maxDistance, 0, 1);
            let shadowOffset = (orbitingCircleRadius * 0.9) * depthScale;
            
            // Calculate shadow direction
            let dirX = vanishX - orbitX;
            let dirY = vanishY - orbitY;
            let length = sqrt(dirX * dirX + dirY * dirY);
            let normX = dirX / length;
            let normY = dirY / length;
            
            // Draw the shadow for the orbiting circle
            noStroke();
            fill(0, 120); // Semi-transparent black
            ellipse(
                orbitX + (normX * shadowOffset),
                orbitY + (normY * shadowOffset),
                orbitingCircleRadius * 2 // Diameter = radius * 2
            );
            
            // Draw the white orbiting circle
            fill(0);
            stroke(0);
            strokeWeight(1);
            ellipse(orbitX, orbitY, orbitingCircleRadius * 2); // Diameter = radius * 2
        }
    }
    
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
            circle.fixed = random() < 0;  // 30% chance to be fixed
        });
        
        // Make sure at least one circle is fixed to anchor the composition
        if (!circles.some(c => c.fixed)) {
            circles[0].fixed = false;
        }
        
        // Reset rest state with new composition
        restState = false;
        
        // Initialize gravity point with each new composition
        initializeGravityPoint();
    }

 function initializeGravityPoint() {
   
  // Instead of random position, select a circle to be the gravity center
  if (circles.length > 0) {
    // Options for selecting the gravity circle:
    
    // Option 1: Choose a random circle
    let gravityCircle = random(circles);
    
    // Option 2: Choose the largest circle (feels more natural)
    // let gravityCircle = circles.reduce((largest, current) => 
    //   current.r > largest.r ? current : largest, circles[0]);
    
    // Option 3: Choose a circle in the upper half of the canvas
    // let upperCircles = circles.filter(c => c.y < height * 0.5);
    // let gravityCircle = upperCircles.length > 0 ? random(upperCircles) : random(circles);
    
    // Set the gravity point to the center of the chosen circle
    gravityPoint.x = gravityCircle.x;
    gravityPoint.y = gravityCircle.y;
    
    
    // Optionally, make this circle fixed so it doesn't move
    gravityCircle.fixed = false;
    
    // Visually distinguish the gravity circle (optional)
    gravityCircle.isGravityCenter = true;
    
    
    console.log('Gravity center set to circle at:', gravityPoint.x, gravityPoint.y);
  } else {
    // Fallback if no circles exist (shouldn't happen)
    gravityPoint.x = width * 0.5;
    gravityPoint.y = height * 0.4;
  }
  /////////////////////gravitydog
  // Use much lower strength values
  gravityStrength = random(0.003, 1.5008);
  
  // Record the start time for warmup period
  gravityStartTime = millis();
}


    function drawRingHoles() {
        for (let circle of circles) {
            if (!circle.ringHoleEnabled) continue;
            
            // Calculate inner circle diameter based on ratio
            let innerDiameter = circle.r * 2 * circle.innerCircleRatio;
            
            // Calculate ring thickness
            let ringThickness = (circle.r * 2 - innerDiameter) / 2;
            
            // Calculate the radius to the center of the ring thickness
            let ringRadius = innerDiameter/2 + ringThickness/2;
            
            // Calculate the position of the orbiting circle
            let orbitX = circle.x + cos(circle.ringHoleAngle) * ringRadius;
            let orbitY = circle.y + sin(circle.ringHoleAngle) * ringRadius;
            
            // Calculate shadow properties for depth
            const vanishX = width/2;
            const vanishY = height/2;
            const maxDistance = dist(0, 0, width, height);
            let distance = dist(circle.x, circle.y, vanishX, vanishY);
            let depthScale = map(distance, 0, maxDistance, 0, 1);
            
            // Calculate shadow direction
            let dirX = vanishX - orbitX;
            let dirY = vanishY - orbitY;
            let length = sqrt(dirX * dirX + dirY * dirY);
            let normX = dirX / length;
            let normY = dirY / length;
            
            // Draw the shadow for the orbiting circle
            noStroke();
            fill(0, 120); // Semi-transparent black for shadow
            
            // Size the orbiting circle based on ring thickness
            let orbitSize = min(ringThickness, circle.r * 0);
            
            ellipse(
                orbitX + (normX * (orbitSize * 0.5 * depthScale)),
                orbitY + (normY * (orbitSize * 0.5 * depthScale)),
                orbitSize
            );
            
            // Draw the white orbiting circle
            fill(255);
            stroke();
            strokeWeight(3);
            ellipse(orbitX, orbitY, orbitSize);
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
            // Keep the rotation angle for the inner circle static (no rotation)
            rotationAngle: 0,
            rotationSpeed: random(minRotationSpeed, maxRotationSpeed),
            rotationDirection: random() < 0.5 ? 1 : -1,
            innerCircleRatio: random(minInnerCircleRatio, maxInnerCircleRatio),
            bounceCount: 0,           // Track number of bounces
            bounceTime: 0,            // Track time since last bounce
            lastBounceVelocity: 0,    // Track velocity of last bounce
          
            // Add orbiting circle properties
            orbitEnabled: true,
            orbitAngle: random(TWO_PI),   // Starting angle for the orbit
            orbitSpeed: random(0.001, .01), // Speed of rotation
            orbitDirection: random() > 0.5 ? 1 : -1, // Direction of rotation
            
            // Add randomized size for the orbiting circle (10-90% of the host circle)
            orbitingCircleRatio: random(0.5, 0.9),
            
            // Other properties remain the same
            legType: (() => {
                const r = random();
                if (r < 0.35) return LEG_TYPES.SINGLE_STRAIGHT;
                if (r < 0.70) return LEG_TYPES.DOUBLE_STRAIGHT;
                if (r < 0.78) return LEG_TYPES.CURVED_LEFT_CENTER;
                if (r < 0.86) return LEG_TYPES.CURVED_CENTER_RIGHT;
                if (r < 0.93) return LEG_TYPES.CURVED_LEFT_RIGHT;
                return LEG_TYPES.NONE;
            })(),
            
            // Physics properties 
            vx: 0,          
            vy: 0,          
            mass: r * r,    
            fixed: false,   
            connections: [] 
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
        strokeWeight(strokeWeight);

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
        const offsetMultiplier = 1;
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
    }

    function drawOutlines() {
        noFill();
        stroke(0);
        strokeWeight(3);
        for (let circle of circles) {
            ellipse(circle.x, circle.y, circle.r * 2);
        }
    }
function drawBounceEffects() {
  // Update and draw all bounce effects
  for (let i = bounceEffects.length - 1; i >= 0; i--) {
    let effect = bounceEffects[i];
    
    // Update effect properties
    effect.life -= 15;  // Decrease life
    effect.alpha = effect.life;  // Fade out
    effect.size += 2;   // Expand
    
    // Draw the effect
    noFill();
    stroke(255, 255, 255, effect.alpha);
    strokeWeight(2);
    ellipse(effect.x, effect.y, effect.size);
    
    // Remove dead effects
    if (effect.life <= 0) {
      bounceEffects.splice(i, 1);
    }
  }
}

function drawHelpSystem() {
    // Draw the blue plus sign
    textSize(45);
    textAlign(CENTER, CENTER);
    fill(0);
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
            "- G - Toggle gravity effect",
            "- N - New composition",
            "- A - Add circle",
            "- R - Regenerate connections",
            "",
            "Physics Mode:",
            "- Move mouse quickly to",
            "  influence nearby circles"
        ];
        
        guide.forEach((line, i) => {
            text(line, HELP_ZONE.x + 30, HELP_ZONE.y - 5 + (i * 14));
        });
    }
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

function updatePhysics() {
  if (!enablePhysics) return;
  
  // Calculate warmup factor (0 to 1) based on elapsed time
  let currentTime = millis();
  let warmupFactor = min((currentTime - gravityStartTime) / gravityWarmupPeriod, 1);
  warmupFactor = smoothstep(warmupFactor); 
  
  // Calculate mouse velocity for influence
  let mouseVelX = mouseX - pmouseX;
  let mouseVelY = mouseY - pmouseY;
  
  for (let circle of circles) {
    if (circle.fixed || isDragging && circle === selectedCircle) continue;
    
    // Skip circles that have reached rest state
    if (restState) {
      let dx = gravityPoint.x - circle.x;
      let dy = gravityPoint.y - circle.y;
      let distance = sqrt(dx * dx + dy * dy);
      
      if (distance < restDistance) {
        circle.vx = 0;
        circle.vy = 0;
        continue;
      }
    }
    
    // Apply upward drift
    circle.vy += gravity;
    
    // Apply gravitational pull toward gravity point
    let dx = gravityPoint.x - circle.x;
    let dy = gravityPoint.y - circle.y;
    let distance = sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Apply damping when close to gravity point (prevents jiggling)
      let closenessFactor = 1.0;
      
      if (distance < 200) {
        closenessFactor = map(distance, 0, 200, 0.7, 1.0); // Less damping (was 0.3)
        
        // Apply velocity damping
        circle.vx *= closenessFactor;
        circle.vy *= closenessFactor;
        
        // Additional directional damping when very close
        if (distance < 100) {
          // Calculate vectors toward gravity point
          let towardGravityX = dx / distance;
          let towardGravityY = dy / distance;
          
          // Calculate the component of velocity in the direction of the gravity point
          let dotProduct = circle.vx * towardGravityX + circle.vy * towardGravityY;
          
          // If the circle is moving toward the gravity point, slow it down more
          if (dotProduct < 0) {
            // Extract the velocity component moving toward the gravity point
            let towardVelocityX = dotProduct * towardGravityX;
            let towardVelocityY = dotProduct * towardGravityY;
            
            // Apply less damping
            circle.vx -= towardVelocityX * 0.6; // Less damping (was 0.9)
            circle.vy -= towardVelocityY * 0.6;
          }
          
          // Detect and stop jiggling
          if (distance < restDistance) {
            let speed = sqrt(circle.vx * circle.vx + circle.vy * circle.vy);
            
            if (speed < restThreshold) {
              circle.vx = 0;
              circle.vy = 0;
            }
          }
        }
      }
      
      // Add velocity clamping
      if (distance < 150) {
        // Calculate maximum allowed speed based on distance - allow higher speeds
        let maxSpeed = map(distance, 0, 150, 0.2, 2.0); // Higher max speeds (was 0.05, 1.0)
        
        // Get current speed
        let currentSpeed = sqrt(circle.vx * circle.vx + circle.vy * circle.vy);
        
        // If moving too fast, scale velocity down
        if (currentSpeed > maxSpeed && currentSpeed > 0) {
          let scaleFactor = maxSpeed / currentSpeed;
          circle.vx *= scaleFactor;
          circle.vy *= scaleFactor;
        }
      }
      
      // Create a smaller dead zone near the gravity point
      if (distance > gravityDeadZone) {
        let baseStrength = gravityStrength * warmupFactor;
        
        // Use a stronger distance factor
        let distanceFactor = 1.0 / (1.0 + distance * 0.001); // Less falloff with distance (was 0.005)
        
        // Ensure minimum velocity for more consistent movement
        let minVelocityComponent = 0.1; // Increased from 0.05
        circle.vx += (dx / distance) * minVelocityComponent;
        circle.vy += (dy / distance) * minVelocityComponent;

        // Calculate final gravity factor
        let gravityFactor = baseStrength * distanceFactor;
        
        // Set a stronger minimum gravity strength
        let minGravityStrength = gravityStrength * 0.3; // Increased from 0.2
        gravityFactor = max(gravityFactor, minGravityStrength);
        
        // Apply gravity force with more power
        circle.vx += (dx / distance) * gravityFactor * 2; // Doubled the force
        circle.vy += (dy / distance) * gravityFactor * 2;
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
  
  // NEW: Check if all circles have reached the "rest state"
  let allCirclesAtRest = true;
  for (let circle of circles) {
    if (circle.fixed || isDragging && circle === selectedCircle) continue;
    
    let dx = gravityPoint.x - circle.x;
    let dy = gravityPoint.y - circle.y;
    let distance = sqrt(dx * dx + dy * dy);
    let speed = sqrt(circle.vx * circle.vx + circle.vy * circle.vy);
    
    // If any circle is still moving significantly or far from gravity point
    if (distance > restDistance || speed > restThreshold) {
      allCirclesAtRest = false;
      break;
    }
  }

  // If all circles are at rest, enable the rest state (slightly different physics)
  restState = allCirclesAtRest;
   // Process sun bounces for all circles
 for (let circle of circles) {
   handleSunBounce(circle);
 }
}

function handleSunBounce(circle) {
  if (!sunBounceEnabled || circle.fixed) return;
  
  // Find the circle that is the gravity center
  let sunCircle = circles.find(c => c.isGravityCenter);
  if (!sunCircle) return;
  
  // Calculate distance to the sun/gravity center
  let dx = sunCircle.x - circle.x;
  let dy = sunCircle.y - circle.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate combined radius (sun + circle + a small margin)
  let combinedRadius = sunCircle.r + circle.r + 2;
  
  // If the circle is too close to the sun
  if (distance < combinedRadius) {
    // Calculate the circle's current velocity magnitude
    let velocityMagnitude = Math.sqrt(circle.vx * circle.vx + circle.vy * circle.vy);
    
    // Only bounce if velocity is above threshold
    if (velocityMagnitude > bounceThreshold) {
      // Calculate normal vector from sun to circle
      let nx = dx / distance;
      let ny = dy / distance;
      
      // Calculate the dot product of velocity and normal vector
      let dot = circle.vx * nx + circle.vy * ny;
      
      // Only bounce if moving toward the sun
      if (dot < 0) {
        // Increment bounce count 
        circle.bounceCount = (circle.bounceCount || 0) + 1;
        circle.bounceTime = millis();
        
        // Store this bounce velocity for potential animation effects
        circle.lastBounceVelocity = Math.abs(dot);
        
        // Calculate the reflection vector
        let rx = circle.vx - 2 * dot * nx;
        let ry = circle.vy - 2 * dot * ny;
        if (circle.bounceCount === 1) {
  // Extra velocity boost on first bounce
  rx *= 1.5;
  ry *= 1.5;
}
        
        // Apply damping factor - this gets smaller with each bounce
        let currentDamping = bounceDamping * Math.pow(0.9, circle.bounceCount);
        
        // Set new velocity
        circle.vx = rx * currentDamping;
        circle.vy = ry * currentDamping;
        
        // Add a bit of repulsion to prevent sticking
        circle.vx += nx * bounceRepulsionStrength;
        circle.vy += ny * bounceRepulsionStrength;
        
        // Push the circle outside the sun to prevent overlap
        let pushDistance = combinedRadius - distance;
        circle.x += nx * pushDistance;
        circle.y += ny * pushDistance;
        
        
        
        // After a few bounces, start reducing velocity more dramatically
        if (circle.bounceCount > maxBounces) {
          circle.vx *= 0.7;
          circle.vy *= 0.7;
        }
      }
    }
  }
  
  // Reset bounce count if we're far enough away and it's been a while
  if (distance > combinedRadius * 2 && 
      millis() - circle.bounceTime > 2000 && 
      circle.bounceCount > 0) {
    circle.bounceCount = 0;
  }
}

function smoothstep(x) {
  // Modified easing function with sharper acceleration after the initial pause
  // This creates a more sudden "come together" effect after the delay
  if (x < 0.3) {
    // Very slow start (first 30% of time)
    return x * x * x * 3.3; // Cubic ease with scaling
  } else {
    // Accelerated middle and end (remaining 70%)
    return 0.27 + (x - 0.3) * (x - 0.3) * 1.5;
  }
}

function drawGravityPoint() {
  // Only draw if physics is enabled
  if (!enablePhysics) return;
  
  // Calculate warmup factor for visual feedback
  let currentTime = millis();
  let warmupFactor = min((currentTime - gravityStartTime) / gravityWarmupPeriod, 1);
  warmupFactor = smoothstep(warmupFactor);
  
  // Draw gravity field (now affecting the entire canvas, so we just hint at it)
  noFill();
  stroke(255, 0, 0, 30 * warmupFactor); // Transparent red, fades in
  strokeWeight(1);
  
  // Draw concentric circles radiating from gravity point
  for (let r = 50; r <= 300; r += 50) {
    ellipse(gravityPoint.x, gravityPoint.y, r * 2, r * 2);
  }
  
  // Draw gravity point
  noFill();
  stroke(255, 0, 0, 100 * warmupFactor); // More visible red, fades in
  strokeWeight(2);
  ellipse(gravityPoint.x, gravityPoint.y, 15, 15);
  
  // Draw dead zone
  noFill();
  stroke(255, 0, 0, 40 * warmupFactor);
  strokeWeight(1);
  ellipse(gravityPoint.x, gravityPoint.y, gravityDeadZone * 2, gravityDeadZone * 2);
  
  // Optional: Draw small crosshairs to highlight the center
  line(gravityPoint.x - 7, gravityPoint.y, gravityPoint.x + 7, gravityPoint.y);
  line(gravityPoint.x, gravityPoint.y - 7, gravityPoint.x, gravityPoint.y + 7);
}

// Draw spring connections as dashed lines
function drawConnections() {
    // Function is kept but does nothing now - connection lines are hidden
    // The physics of connections will still work, just without visual representation
}



///////////////////////////END OF U P D A T E P H Y S I C S /////////////////

function keyPressed(event) {
    if (keyCode === 32) {  // Space bar
        enablePhysics = !enablePhysics;  // Toggle physics mode
        console.log('Physics mode:', enablePhysics ? 'enabled' : 'disabled');
        return false;
}

  if (keyCode === 66) { // 'B' key
  sunBounceEnabled = !sunBounceEnabled;
  console.log('Sun bounce effect:', sunBounceEnabled ? 'enabled' : 'disabled');
  return false;
}
    
    if (keyCode === 71) {  // 'G' key - NEW key handler for gravity
        // Toggle gravity strength between 0 and normal value
        if (gravityStrength > 0) {
            gravityStrength = 0;
            console.log('Gravity disabled');
        } else {
            gravityStrength = random(0.00015, 0.0003);
            console.log('Gravity enabled:', gravityStrength);
            // Reset warmup period when re-enabling
            gravityStartTime = millis();
        }
        return false;
    }
    
    if (keyCode === 79) {  // 'O' key
        if (selectedCircle) {
            selectedCircle.orbitEnabled = !selectedCircle.orbitEnabled;
            if (selectedCircle.orbitEnabled) {
                // Reset orbiting circle properties when enabling
                selectedCircle.orbitAngle = random(TWO_PI);
                selectedCircle.orbitSpeed = random(0.001, 0.01);
                selectedCircle.orbitDirection = random() > 0.5 ? 1 : -1;
            }
            console.log('Orbiting circle:', selectedCircle.orbitEnabled ? 'enabled' : 'disabled');
            redraw();
        }
        return false;
    }
    
    if (keyCode === 84) {  // 'T' key for Toggle auto-regeneration
        autoRegenerate = !autoRegenerate;
        console.log('Auto-regenerate:', autoRegenerate ? 'enabled' : 'disabled');
        lastRegenTime = millis(); // Reset timer whenever toggled
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
            
            console.log('Changing leg type to:', selectedCircle.legType);
            
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
