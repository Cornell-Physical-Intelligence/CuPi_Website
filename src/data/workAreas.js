export const WORK_AREAS = [
  {
    title: 'Robotic Manipulation Tasks',
    ratio: '1 / 1',
    clips: [
      {
        src: '/media/arm-ball-960.mp4',
        poster: 'arm-ball',
        label: 'Play: a 3D-printed arm picking up a ball',
      },
      {
        src: '/media/arm-meat-960.mp4',
        poster: 'arm-meat',
        label: 'Play: a robot arm cutting on a processing line',
      },
    ],
    summary: `Our robotic-manipulation work runs a fine-tuned π0.5 policy on our own arm.
      π0.5 is the robotics company Physical Intelligence's open vision-language-action
      model, so we are not
      training from scratch: the released checkpoint brings broad manipulation priors
      from web and robot data, and our work is adapting it to the grippers, camera
      placement, and tasks in our lab.`,
  },
  {
    title: 'Autonomous Perception and Navigation',
    ratio: '4 / 3',
    clips: [
      {
        src: '/media/drone-sim-960.mp4',
        poster: 'drone-sim',
        label: 'Play: a quadrotor flying a simulated race course',
      },
      {
        src: '/media/drone-gates-960.mp4',
        poster: 'drone-gates',
        label: 'Play: an FPV replay showing gate detections and live telemetry',
      },
    ],
    summary: `We build the autonomy stack for the Anduril AI Grand Prix, an autonomous
      drone racing competition run with the Drone Champions League. We passed Virtual
      Qualifier 1 with a fully deterministic policy: no learned network anywhere in the
      loop, just dead reckoning against the released course map with visual gate
      corrections. Virtual Qualifier 2 blocks every pose and gate telemetry stream,
      leaving a monocular camera and IMU, so our successor work explores bearings-only
      guidance and optical looming without a surveyed map.`,
    partner: {
      href: 'https://theaigrandprix.com/',
      src: 'icons/ai-gp-logo-orange.svg',
      alt: 'AI Grand Prix',
    },
  },
];

export const normalizedWorkSummary = (area) => area.summary.replace(/\s+/g, ' ').trim();
